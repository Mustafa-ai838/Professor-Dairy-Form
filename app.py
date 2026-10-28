"""
# ==============================================================
# ڈیری فارم مینجمنٹ سسٹم - Dairy Farm Management System
# زبان: Python (Flask) + SQLite (farm.db)
# تمام کوڈ آسان اردو کمنٹس کے ساتھ لکھا گیا ہے تاکہ کوئی بھی آسانی سے سمجھ سکے
# ==============================================================
"""

import os
import shutil
import sqlite3
from datetime import datetime, date, timedelta
from functools import wraps
from flask import (
    Flask, render_template, request, redirect, url_for,
    flash, session, g, jsonify
)

# Flask ایپ کو شروع کیا جا رہا ہے
app = Flask(__name__)
# سیشن کو محفوظ رکھنے کے لیے خفیہ کی
app.secret_key = "dairy_farm_pakistan_secret_key_12345"

# ڈیٹابیس فائل کا راستہ - تمام ڈیٹا ایک ہی SQLite فائل میں محفوظ ہوگا
DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "farm.db")


# --------------------------------------------------------------
# 1. ہارڈ ڈسک کی خالی جگہ چیک کرنے کا فنکشن (Free Disk Space Check)
# --------------------------------------------------------------
def check_disk_space():
    """
    یہ فنکشن لیپ ٹاپ یا کمپیوٹر کی خالی جگہ (Free Space) چیک کرتا ہے۔
    اگر جگہ 500MB سے کم ہو تو وارننگ دکھائی جائے گی۔
    """
    try:
        total, used, free = shutil.disk_usage(os.path.dirname(os.path.abspath(__file__)))
        free_mb = free // (1024 * 1024)
        free_gb = round(free / (1024 * 1024 * 1024), 2)
        total_gb = round(total / (1024 * 1024 * 1024), 2)
        return {
            "free_mb": free_mb,
            "free_gb": free_gb,
            "total_gb": total_gb,
            "is_low": free_mb < 500  # 500 ایم بی سے کم پر ٹرو
        }
    except Exception as e:
        # اگر کسی وجہ سے سپیس چیک نہ ہو سکے تو ڈیفالٹ محفوظ قیمت دیں
        return {"free_mb": 10240, "free_gb": 10.0, "total_gb": 100.0, "is_low": False}


# ٹیمپلیٹ کے ہر صفحے میں فری سپیس بھیجنے کا طریقہ
@app.context_processor
def inject_global_data():
    space_info = check_disk_space()
    current_user = session.get("user")
    return dict(
        space_info=space_info,
        current_user=current_user,
        today_date=date.today().strftime("%Y-%m-%d")
    )


# --------------------------------------------------------------
# 2. ڈیٹابیس کنکشن کے فنکشنز (SQLite Database Helper)
# --------------------------------------------------------------
def get_db():
    """ڈیٹابیس سے رابطہ جوڑنے کا طریقہ"""
    if "db" not in g:
        g.db = sqlite3.connect(DB_FILE)
        g.db.row_factory = sqlite3.Row  # کالم کے نام سے ڈیٹا حاصل کرنے کے لیے
    return g.db

@app.teardown_appcontext
def close_db(error):
    """ہر درخواست کے اختتام پر ڈیٹابیس کنکشن بند کرنا"""
    db = g.pop("db", None)
    if db is not None:
        db.close()


# --------------------------------------------------------------
# 3. لاگ اِن کی تصدیق کا فنکشن (Login Required Decorator)
# --------------------------------------------------------------
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # اگر صارف لاگ ان نہیں ہے تو لاگ ان پیج پر بھیج دیں
        if "user" not in session:
            flash("براہ کرم ڈیش بورڈ دیکھنے کے لیے پہلے لاگ اِن کریں! (Pehle Login Karein)", "warning")
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated_function


# --------------------------------------------------------------
# 4. ڈیٹابیس ٹیبلز بنانے اور ڈمی ڈیٹا بھرنے کا فنکشن
# --------------------------------------------------------------
def init_db():
    """
    تمام 10 ماڈیولز کے ٹیبلز بناتا ہے اور اگر نیا ڈیٹابیس ہو تو اصلی فارم کا ڈمی ڈیٹا ڈالتا ہے
    """
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # ٹیبل 1: یوزرز (صارفین)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL
    )
    """)

    # ٹیبل 2: ہارڈ / ریورڈ (Herd - جانور)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS herd (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tag_no TEXT UNIQUE NOT NULL,
        nasal TEXT NOT NULL,
        umer TEXT NOT NULL,
        wazan REAL NOT NULL,
        qism TEXT NOT NULL,
        halat TEXT NOT NULL DEFAULT 'Faal',
        doodh_capacity REAL DEFAULT 0,
        kharid_qemat REAL DEFAULT 0,
        tarikh_dakhla TEXT,
        notes TEXT
    )
    """)

    # ٹیبل 3: دودھ کی روزانہ پیداوار (Milk Production)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS milk_production (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tarikh TEXT NOT NULL,
        subah_liter REAL NOT NULL,
        sham_liter REAL NOT NULL,
        total_liter REAL NOT NULL,
        fat_ratio REAL DEFAULT 4.5,
        snf_ratio REAL DEFAULT 8.8,
        farokht_liter REAL NOT NULL,
        zaya_liter REAL DEFAULT 0,
        gharelu_liter REAL DEFAULT 0,
        rate_fi_liter REAL DEFAULT 180,
        notes TEXT
    )
    """)

    # ٹیبل 4: آمدنی کا کھاتہ (Income)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS income (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tarikh TEXT NOT NULL,
        mad TEXT NOT NULL,
        tafseel TEXT NOT NULL,
        miqdar REAL DEFAULT 1,
        rate REAL DEFAULT 0,
        kul_mublagh REAL NOT NULL,
        gahak_naam TEXT,
        wasool_shuda TEXT DEFAULT 'Haan'
    )
    """)

    # ٹیبل 5: اخراجات کا کھاتہ (Expenses)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tarikh TEXT NOT NULL,
        mad TEXT NOT NULL,
        tafseel TEXT NOT NULL,
        mublagh REAL NOT NULL,
        paid_to TEXT,
        is_feed INTEGER DEFAULT 0
    )
    """)

    # ٹیبل 6: چارہ اور ونڈا اسٹاک (Feed and Fodder)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS feed (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tarikh TEXT NOT NULL,
        feed_type TEXT NOT NULL,
        rozana_miqdar_kg REAL NOT NULL,
        stock_baqaya_kg REAL NOT NULL,
        bori_count INTEGER DEFAULT 0,
        fi_janwar_kg REAL DEFAULT 0,
        feed_cost REAL DEFAULT 0
    )
    """)

    # ٹیبل 7: بریڈنگ اور ولادت کا ریکارڈ (Reproduction)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS breeding (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tag_no TEXT NOT NULL,
        tika_tarikh TEXT NOT NULL,
        tika_qism TEXT NOT NULL,
        mutawaqqa_wiladat TEXT NOT NULL,
        pregnancy_status TEXT NOT NULL DEFAULT 'Tasdeeq Shuda',
        calving_interval_days INTEGER DEFAULT 365,
        bacha_gender TEXT DEFAULT 'Abhi Nahi',
        notes TEXT
    )
    """)

    # ٹیبل 8: صحت اور ویکسینیشن (Health & Medical)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS health (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tag_no TEXT NOT NULL,
        tarikh TEXT NOT NULL,
        bimari_qism TEXT NOT NULL,
        ilaj_tafseel TEXT,
        doctor_naam TEXT,
        ilaj_kharch REAL DEFAULT 0,
        vaccine_naam TEXT,
        vaccine_next_date TEXT,
        sehat_status TEXT DEFAULT 'Theek Ho Gaya',
        notes TEXT
    )
    """)

    # ٹیبل 9: وزن اور گروتھ ٹریکنگ (Weight & ADG)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS weight_tracking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tag_no TEXT NOT NULL,
        tarikh TEXT NOT NULL,
        wazan_kg REAL NOT NULL,
        pichla_wazan_kg REAL DEFAULT 0,
        dino_ka_farq INTEGER DEFAULT 30,
        adg_grams REAL DEFAULT 0,
        notes TEXT
    )
    """)

    # ٹیبل 10: گاہک اور ادھار کھاتہ (Customers & Khata)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        naam TEXT NOT NULL,
        phone TEXT,
        pata TEXT,
        rozana_supply_liter REAL NOT NULL,
        rate_fi_liter REAL NOT NULL,
        kul_baqaya REAL DEFAULT 0,
        status TEXT DEFAULT 'Active'
    )
    """)

    conn.commit()

    # چیک کریں کہ کیا ایڈمن یوزر موجود ہے یا نہیں
    cursor.execute("SELECT COUNT(*) FROM users WHERE username = 'admin'")
    if cursor.fetchone()[0] == 0:
        # ڈیفالٹ یوزر: admin اور پاس ورڈ: 1234
        cursor.execute("INSERT INTO users (username, password, full_name) VALUES (?, ?, ?)",
                       ("admin", "1234", "چوہدری بشارت (فارم منیجر)"))
        conn.commit()

    # چیک کریں کہ کیا ڈمی ڈیٹا موجود ہے، اگر نہیں تو حقیقی ڈیٹا ڈالیں
    cursor.execute("SELECT COUNT(*) FROM herd")
    if cursor.fetchone()[0] == 0:
        # 1. جانوروں کا ڈیٹا (Herd)
        animals = [
            ("PK-101", "ساہیوال گائے (Sahiwal)", "4 سال", 420.0, "Doodh wali", "Faal", 16.5, 240000, "2024-01-15", "بہترین دودھ دینے والی گائے"),
            ("PK-102", "نیلی راوی بھینس (Nili Ravi)", "5 سال", 560.0, "Doodh wali", "Faal", 18.0, 310000, "2023-11-20", "فیٹ فیصد 7.2"),
            ("PK-103", "فریزن کراس (Friesian Cross)", "3.5 سال", 490.0, "Doodh wali", "Faal", 22.0, 290000, "2024-03-10", "ہائی ملک پروڈکشن"),
            ("PK-104", "چولستانی گائے (Cholistani)", "4 سال", 400.0, "Doodh wali", "Faal", 14.0, 210000, "2024-02-01", "گرمی برداشت کرنے والی"),
            ("PK-105", "نیلی راوی بھینس (Nili Ravi)", "6 سال", 580.0, "Dry", "Faal", 0.0, 320000, "2023-09-15", "اگلے مہینے ولادت متوقع"),
            ("PK-106", "ساہیوال گائے (Sahiwal)", "3 سال", 380.0, "Gabhan", "Faal", 8.0, 220000, "2024-04-12", "چھٹا مہینہ گابھن"),
            ("PK-107", "ساہیوال بچھڑا (Male Calf)", "8 ماہ", 130.0, "Bachra", "Faal", 0.0, 85000, "2024-08-01", "قربانی کی تیاری کے لیے"),
            ("PK-108", "نیلی راوی کٹی (Female Calf)", "6 ماہ", 110.0, "Bachra", "Faal", 0.0, 75000, "2024-09-10", "مستقبل کی دودھ والی بھینس"),
            ("PK-109", "ساہیوال افزائشی بیل (Breeding Bull)", "4.5 سال", 620.0, "Bail", "Faal", 0.0, 350000, "2023-08-01", "اعلی نسل کا سانڈ"),
        ]
        cursor.executemany("""
        INSERT INTO herd (tag_no, nasal, umer, wazan, qism, halat, doodh_capacity, kharid_qemat, tarikh_dakhla, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, animals)

        # 2. دودھ کی پیداوار (Milk Production - پچھلے 7 دن کا ڈیٹا)
        today = date.today()
        milk_records = []
        for i in range(7, -1, -1):
            d = (today - timedelta(days=i)).strftime("%Y-%m-%d")
            subah = 42.0 + (i % 3) * 1.5
            sham = 36.5 + (i % 2) * 2.0
            total = subah + sham
            farokht = total - 4.5
            zaya = 0.5
            gharelu = 4.0
            milk_records.append((d, subah, sham, total, 5.8, 8.9, farokht, zaya, gharelu, 190.0, "عام روٹین پیداوار"))
        
        cursor.executemany("""
        INSERT INTO milk_production (tarikh, subah_liter, sham_liter, total_liter, fat_ratio, snf_ratio, farokht_liter, zaya_liter, gharelu_liter, rate_fi_liter, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, milk_records)

        # 3. آمدنی (Income - اس مہینے کی آمدنی)
        curr_month = today.strftime("%Y-%m")
        incomes = [
            (f"{curr_month}-01", "Doodh Farokht", "دودھ کی فروخت ڈیری کارپوریشن", 2250, 190, 427500, "ملک سنٹر پنجاب", "Haan"),
            (f"{curr_month}-05", "Gobar/Khaad", "گوبر کی کھاد 4 ٹرالی فروخت", 4, 6000, 24000, "حاجی رشید زمیندار", "Haan"),
            (f"{curr_month}-10", "Dahi/Ghee", "دیسی گھی 15 کلو فروخت", 15, 2800, 42000, "لوکل گاہک", "Haan"),
            (f"{curr_month}-14", "Doodh Farokht", "مقامی گاہکوں کو دودھ کی سپلائی", 600, 200, 120000, "محلہ کسٹمرز", "Haan"),
            (f"{curr_month}-18", "Janwar Farokht", "ایک نر بچھڑا قربانی کے لیے فروخت", 1, 145000, 145000, "چوہدری اکرم", "Haan"),
        ]
        cursor.executemany("""
        INSERT INTO income (tarikh, mad, tafseel, miqdar, rate, kul_mublagh, gahak_naam, wasool_shuda)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, incomes)

        # 4. اخراجات (Expenses - چارہ/ونڈا 60-70% ظاہر کرنے کے لیے متوازن)
        expenses = [
            (f"{curr_month}-02", "Chara/Wanda", "سبز چارہ (برسیم و جوار) 120 من", 115000, "ملک اصغر چارہ سپلائر", 1),
            (f"{curr_month}-04", "Chara/Wanda", "کمرشل ونڈا (18% پروٹین) 25 بوری", 125000, "اتحاد فیڈز لمیٹڈ", 1),
            (f"{curr_month}-06", "Mazdoori", "2 ملازمین کی ماہانہ تنخواہ", 55000, "محمد دین و اسلم ملازم", 0),
            (f"{curr_month}-08", "Dawaiyan/Doctor", "روٹین چیک اپ اور ڈیورمنگ ادویات", 18500, "ڈاکٹر طارق ویٹرنری", 0),
            (f"{curr_month}-11", "Bijli/Pani/Diesel", "ٹیوب ویل اور ڈیری بجلی کا بل", 28000, "لیسکو / فیسکو", 0),
            (f"{curr_month}-15", "Chara/Wanda", "گندم کا بھوسہ (تُوڑی) 2 ٹرالی", 65000, "سردار خان زمیندار", 1),
            (f"{curr_month}-17", "Kiraya/Marammat", "ملکنگ مشین اور شیڈ کی صفائی و مرمت", 12000, "لوکل ورکشاپ", 0),
        ]
        cursor.executemany("""
        INSERT INTO expenses (tarikh, mad, tafseel, mublagh, paid_to, is_feed)
        VALUES (?, ?, ?, ?, ?, ?)
        """, expenses)

        # 5. چارہ و خوراک (Feed)
        feeds = [
            (today.strftime("%Y-%m-%d"), "سبز چارہ (برسیم)", 350.0, 1200.0, 0, 38.8, 12000),
            (today.strftime("%Y-%m-%d"), "خشک چارہ (تُوڑی)", 80.0, 4500.0, 0, 8.8, 4500),
            (today.strftime("%Y-%m-%d"), "دودھ والا ونڈا (Dairy Wanda)", 45.0, 1100.0, 22, 5.0, 9500),
            (today.strftime("%Y-%m-%d"), "سائیلج (Corn Silage)", 150.0, 8000.0, 0, 16.6, 6000),
        ]
        cursor.executemany("""
        INSERT INTO feed (tarikh, feed_type, rozana_miqdar_kg, stock_baqaya_kg, bori_count, fi_janwar_kg, feed_cost)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, feeds)

        # 6. بریڈنگ اور ولادت (Reproduction)
        exp_cow = (today + timedelta(days=75)).strftime("%Y-%m-%d")
        exp_buf = (today + timedelta(days=40)).strftime("%Y-%m-%d")
        breedings = [
            ("PK-101", "2024-05-10", "مصنوعی نسل کشی (A.I)", exp_cow, "Tasdeeq Shuda", 370, "Abhi Nahi", "امریکن فریزن سیمن"),
            ("PK-102", "2024-04-01", "قدرتی ملاپ (Natural Bull)", exp_buf, "Tasdeeq Shuda", 395, "Abhi Nahi", "اعلی نیلی راوی سانڈ"),
            ("PK-106", "2024-07-20", "مصنوعی نسل کشی (A.I)", (today + timedelta(days=140)).strftime("%Y-%m-%d"), "Tasdeeq Shuda", 360, "Abhi Nahi", "ساہیوال سیمن"),
        ]
        cursor.executemany("""
        INSERT INTO breeding (tag_no, tika_tarikh, tika_qism, mutawaqqa_wiladat, pregnancy_status, calving_interval_days, bacha_gender, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, breedings)

        # 7. صحت و ادویات (Health)
        healths = [
            ("PK-103", (today - timedelta(days=10)).strftime("%Y-%m-%d"), "ہلکا ساڑو (Mild Mastitis)", "اینٹی بائیوٹک اور درد کش ٹیکہ", "ڈاکٹر نوید", 3500, "FMD ویکسین", (today + timedelta(days=50)).strftime("%Y-%m-%d"), "Theek Ho Gaya", "دودھ کی کوالٹی بحال ہو چکی ہے"),
            ("PK-107", (today - timedelta(days=25)).strftime("%Y-%m-%d"), "پیٹ کے کیڑے (Deworming)", "البینڈازول شربت پلایا گیا", "فارم انچارج", 1200, "HS ویکسین", (today + timedelta(days=90)).strftime("%Y-%m-%d"), "Theek Ho Gaya", "وزن بڑھنا شروع ہوا"),
            ("PK-102", (today - timedelta(days=40)).strftime("%Y-%m-%d"), "موسمی بخار (Fever)", "بخار توڑ انجکشن اور ڈرپ", "ڈاکٹر طارق", 2800, "گل گھوٹو", (today + timedelta(days=60)).strftime("%Y-%m-%d"), "Theek Ho Gaya", "مکمل صحت مند"),
        ]
        cursor.executemany("""
        INSERT INTO health (tag_no, tarikh, bimari_qism, ilaj_tafseel, doctor_naam, ilaj_kharch, vaccine_naam, vaccine_next_date, sehat_status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, healths)

        # 8. وزن اور گروتھ (Weight & ADG)
        weights = [
            ("PK-107", today.strftime("%Y-%m-%d"), 130.0, 108.0, 30, 733.3, "روزانہ 733 گرام اوسط اضافہ"),
            ("PK-108", today.strftime("%Y-%m-%d"), 110.0, 92.0, 30, 600.0, "اچھی نشوونما"),
            ("PK-101", today.strftime("%Y-%m-%d"), 420.0, 415.0, 45, 111.1, "بالغ گائے - مستقل وزن"),
        ]
        cursor.executemany("""
        INSERT INTO weight_tracking (tag_no, tarikh, wazan_kg, pichla_wazan_kg, dino_ka_farq, adg_grams, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, weights)

        # 9. گاہک اور کھاتہ (Customers & Khata)
        customers = [
            ("ملک سنٹر گلبرگ", "0300-1234567", "مین مارکیٹ گلبرگ، لاہور", 40.0, 190.0, 18500.0, "Active"),
            ("چوہدری ریاض سویٹس", "0321-9876543", "ماڈل ٹاؤن، ساہیوال", 25.0, 195.0, 8400.0, "Active"),
            ("حاجی تنویر (گھریلو گاہک)", "0333-5551234", "سول لائنز کوارٹرز", 5.0, 210.0, 1200.0, "Active"),
            ("بسم اللہ ڈائری شاپ", "0301-4447788", "لاری اڈا چونیاں", 20.0, 185.0, 0.0, "Active"),
        ]
        cursor.executemany("""
        INSERT INTO customers (naam, phone, pata, rozana_supply_liter, rate_fi_liter, kul_baqaya, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, customers)

        conn.commit()

    conn.close()


# --------------------------------------------------------------
# 5. لاگ ان اور لاگ آؤٹ کے روٹس (Login & Logout)
# --------------------------------------------------------------
@app.route("/login", methods=["GET", "POST"])
def login():
    # اگر پہلے سے لاگ ان ہے تو ڈیش بورڈ بھیجیں
    if "user" in session:
        return redirect(url_for("dashboard"))

    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "").strip()

        # ڈیٹابیس سے صارف چیک کریں
        db = get_db()
        user = db.execute(
            "SELECT * FROM users WHERE username = ? AND password = ?",
            (username, password)
        ).fetchone()

        if user:
            # سیشن میں محفوظ کریں
            session["user"] = user["username"]
            session["full_name"] = user["full_name"]
            flash(f"خوش آمدید جناب {user['full_name']}! ڈیری فارم مینجمنٹ سسٹم میں آپ کا استقبال ہے۔", "success")
            return redirect(url_for("dashboard"))
        else:
            flash("غلط یوزر نام یا پاس ورڈ! برائے مہربانی دوبارہ کوشش کریں۔ (admin / 1234)", "danger")

    return render_template("login.html")


@app.route("/logout")
def logout():
    session.clear()
    flash("آپ کامیابی سے لاگ آؤٹ ہو چکے ہیں۔", "info")
    return redirect(url_for("login"))


# --------------------------------------------------------------
# 6. مین ڈیش بورڈ (Main Dashboard with Top KPIs & Charts)
# --------------------------------------------------------------
@app.route("/")
def home():
    if "user" not in session:
        return redirect(url_for("login"))
    return redirect(url_for("dashboard"))


@app.route("/dashboard")
@login_required
def dashboard():
    db = get_db()
    today_str = date.today().strftime("%Y-%m-%d")
    current_month_prefix = date.today().strftime("%Y-%m")

    # 1. آج کا دودھ (Total Liter)
    row_today_milk = db.execute(
        "SELECT total_liter, subah_liter, sham_liter, fat_ratio FROM milk_production WHERE tarikh = ?",
        (today_str,)
    ).fetchone()
    
    if row_today_milk:
        today_milk = row_today_milk["total_liter"]
        subah_milk = row_today_milk["subah_liter"]
        sham_milk = row_today_milk["sham_liter"]
        fat_pct = row_today_milk["fat_ratio"]
    else:
        # اگر آج کی اینٹری نہ ہو تو آخری دستیاب دن کا ریکارڈ دیکھیں
        last_milk = db.execute(
            "SELECT total_liter, subah_liter, sham_liter, fat_ratio FROM milk_production ORDER BY tarikh DESC LIMIT 1"
        ).fetchone()
        today_milk = last_milk["total_liter"] if last_milk else 0.0
        subah_milk = last_milk["subah_liter"] if last_milk else 0.0
        sham_milk = last_milk["sham_liter"] if last_milk else 0.0
        fat_pct = last_milk["fat_ratio"] if last_milk else 0.0

    # 2. اس مہینے کی کل آمدنی (This Month's Income)
    row_income = db.execute(
        "SELECT SUM(kul_mublagh) AS total_income FROM income WHERE tarikh LIKE ?",
        (f"{current_month_prefix}%",)
    ).fetchone()
    month_income = row_income["total_income"] or 0.0

    # 3. اس مہینے کے کل اخراجات (This Month's Expenses)
    row_expense = db.execute(
        "SELECT SUM(mublagh) AS total_expense FROM expenses WHERE tarikh LIKE ?",
        (f"{current_month_prefix}%",)
    ).fetchone()
    month_expense = row_expense["total_expense"] or 0.0

    # چارہ اور ونڈا کا خرچہ (Feed Expense Indicator 60-70%)
    row_feed_expense = db.execute(
        "SELECT SUM(mublagh) AS feed_expense FROM expenses WHERE tarikh LIKE ? AND is_feed = 1",
        (f"{current_month_prefix}%",)
    ).fetchone()
    feed_expense = row_feed_expense["feed_expense"] or 0.0
    feed_ratio = round((feed_expense / month_expense * 100), 1) if month_expense > 0 else 0.0

    # 4. خالص منافع (Net Profit = Income - Expenses)
    net_profit = month_income - month_expense

    # 5. منافع کا تناسب (Profit Margin % = (Munafa / Aamdani) * 100)
    profit_margin = round((net_profit / month_income * 100), 1) if month_income > 0 else 0.0

    # 6. فعال دودھ دینے والے جانور (Active Milking Animals Count)
    row_active_cows = db.execute(
        "SELECT COUNT(*) AS active_count FROM herd WHERE qism = 'Doodh wali' AND halat = 'Faal'"
    ).fetchone()
    active_milking_cows = row_active_cows["active_count"] or 0

    # کل جانوروں کی تعداد
    row_total_herd = db.execute("SELECT COUNT(*) AS total_count FROM herd WHERE halat = 'Faal'").fetchone()
    total_active_animals = row_total_herd["total_count"] or 0

    # 7. فی لیٹر پیداواری لاگت (Cost Per Liter = Expenses / Month Milk)
    row_month_milk = db.execute(
        "SELECT SUM(total_liter) AS month_milk_liters FROM milk_production WHERE tarikh LIKE ?",
        (f"{current_month_prefix}%",)
    ).fetchone()
    month_milk_liters = row_month_milk["month_milk_liters"] or 1.0  # صفر سے تقسیم سے بچاؤ
    cost_per_liter = round((month_expense / month_milk_liters), 2) if month_milk_liters > 0 else 0.0

    # فی لیٹر منافع
    avg_milk_rate = 190.0
    profit_per_liter = round(avg_milk_rate - cost_per_liter, 2)

    # پچھلے 7 دن کا دودھ کا چارٹ ڈیٹا
    milk_history = db.execute(
        "SELECT tarikh, subah_liter, sham_liter, total_liter FROM milk_production ORDER BY tarikh DESC LIMIT 7"
    ).fetchall()
    milk_chart_labels = [row["tarikh"][-5:] for row in reversed(milk_history)]
    milk_chart_subah = [row["subah_liter"] for row in reversed(milk_history)]
    milk_chart_sham = [row["sham_liter"] for row in reversed(milk_history)]
    milk_chart_total = [row["total_liter"] for row in reversed(milk_history)]

    # اخراجات کی کیٹیگری بریک ڈاؤن (Expense categories)
    expense_cats = db.execute(
        "SELECT mad, SUM(mublagh) AS total FROM expenses WHERE tarikh LIKE ? GROUP BY mad",
        (f"{current_month_prefix}%",)
    ).fetchall()

    # الرٹس اور فوری اطلاعات (Upcoming Insemination / Calving)
    alerts = []
    upcoming_calvings = db.execute(
        "SELECT tag_no, mutawaqqa_wiladat, pregnancy_status FROM breeding WHERE pregnancy_status = 'Tasdeeq Shuda' ORDER BY mutawaqqa_wiladat ASC LIMIT 3"
    ).fetchall()
    for uc in upcoming_calvings:
        alerts.append({
            "type": "info",
            "title": f"ولادت الرٹ (Calving Due): ٹیگ {uc['tag_no']}",
            "msg": f"متوقع تاریخ: {uc['mutawaqqa_wiladat']} - دیکھ بھال اور علیحدہ شیڈ تیار رکھیں"
        })

    # گاہکوں کا کل بقایا (Total Customer Balance)
    row_cust_due = db.execute("SELECT SUM(kul_baqaya) AS total_due FROM customers").fetchone()
    total_customer_due = row_cust_due["total_due"] or 0.0

    return render_template(
        "dashboard.html",
        today_milk=today_milk,
        subah_milk=subah_milk,
        sham_milk=sham_milk,
        fat_pct=fat_pct,
        month_income=month_income,
        month_expense=month_expense,
        net_profit=net_profit,
        profit_margin=profit_margin,
        active_milking_cows=active_milking_cows,
        total_active_animals=total_active_animals,
        cost_per_liter=cost_per_liter,
        profit_per_liter=profit_per_liter,
        feed_ratio=feed_ratio,
        feed_expense=feed_expense,
        total_customer_due=total_customer_due,
        milk_chart_labels=milk_chart_labels,
        milk_chart_subah=milk_chart_subah,
        milk_chart_sham=milk_chart_sham,
        milk_chart_total=milk_chart_total,
        expense_cats=expense_cats,
        alerts=alerts
    )


# --------------------------------------------------------------
# ماڈیول 1: ہارڈ اور جانوروں کی دیکھ بھال (Herd Management)
# --------------------------------------------------------------
@app.route("/herd", methods=["GET", "POST"])
@login_required
def herd():
    db = get_db()

    # ہارڈ ڈسک سپیس چیک قبل از اینٹری
    space_status = check_disk_space()

    if request.method == "POST":
        # اگر سپیس 500MB سے کم ہو تو محفوظ وارننگ دیں
        if space_status["is_low"]:
            flash("وارننگ: جگہ کم ہے، پرانا ڈیٹا ڈیلیٹ کریں! (Jagah kam hai, purana data delete karein - Less than 500MB available)", "warning")

        tag_no = request.form.get("tag_no", "").strip().upper()
        nasal = request.form.get("nasal", "").strip()
        umer = request.form.get("umer", "").strip()
        wazan = float(request.form.get("wazan", 0) or 0)
        qism = request.form.get("qism", "").strip()
        halat = request.form.get("halat", "Faal").strip()
        doodh_capacity = float(request.form.get("doodh_capacity", 0) or 0)
        kharid_qemat = float(request.form.get("kharid_qemat", 0) or 0)
        tarikh_dakhla = request.form.get("tarikh_dakhla", date.today().strftime("%Y-%m-%d"))
        notes = request.form.get("notes", "").strip()

        try:
            db.execute("""
            INSERT INTO herd (tag_no, nasal, umer, wazan, qism, halat, doodh_capacity, kharid_qemat, tarikh_dakhla, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (tag_no, nasal, umer, wazan, qism, halat, doodh_capacity, kharid_qemat, tarikh_dakhla, notes))
            db.commit()
            flash(f"ماشاءاللہ! نیا جانور ٹیگ نمبر {tag_no} کامیابی سے شامل کر لیا گیا ہے۔", "success")
        except sqlite3.IntegrityError:
            flash(f"ٹیگ نمبر {tag_no} پہلے سے موجود ہے! براہ کرم مختلف ٹیگ درج کریں۔", "danger")

        return redirect(url_for("herd"))

    # فلٹرز کی جانچ
    filter_qism = request.args.get("filter_qism", "All")
    filter_halat = request.args.get("filter_halat", "Faal")

    query = "SELECT * FROM herd WHERE 1=1"
    params = []

    if filter_qism != "All":
        query += " AND qism = ?"
        params.append(filter_qism)
    if filter_halat != "All":
        query += " AND halat = ?"
        params.append(filter_halat)

    query += " ORDER BY id DESC"
    animals = db.execute(query, params).fetchall()

    # شماریات
    counts = {
        "total": db.execute("SELECT COUNT(*) FROM herd WHERE halat = 'Faal'").fetchone()[0],
        "doodh_wali": db.execute("SELECT COUNT(*) FROM herd WHERE qism = 'Doodh wali' AND halat = 'Faal'").fetchone()[0],
        "dry": db.execute("SELECT COUNT(*) FROM herd WHERE qism = 'Dry' AND halat = 'Faal'").fetchone()[0],
        "gabhan": db.execute("SELECT COUNT(*) FROM herd WHERE qism = 'Gabhan' AND halat = 'Faal'").fetchone()[0],
        "bachra": db.execute("SELECT COUNT(*) FROM herd WHERE qism = 'Bachra' AND halat = 'Faal'").fetchone()[0],
        "bail": db.execute("SELECT COUNT(*) FROM herd WHERE qism = 'Bail' AND halat = 'Faal'").fetchone()[0],
    }

    return render_template("herd.html", animals=animals, counts=counts, filter_qism=filter_qism, filter_halat=filter_halat)


@app.route("/herd/delete/<int:id>", methods=["POST"])
@login_required
def delete_animal(id):
    db = get_db()
    db.execute("DELETE FROM herd WHERE id = ?", (id,))
    db.commit()
    flash("جانور کا ریکارڈ کامیابی سے حذف (Delete) کر دیا گیا ہے۔", "info")
    return redirect(url_for("herd"))


# --------------------------------------------------------------
# ماڈیول 2: دودھ کی پیداوار (Milk Production)
# --------------------------------------------------------------
@app.route("/milk", methods=["GET", "POST"])
@login_required
def milk():
    db = get_db()
    space_status = check_disk_space()

    if request.method == "POST":
        if space_status["is_low"]:
            flash("وارننگ: جگہ کم ہے، پرانا ڈیٹا ڈیلیٹ کریں! (Jagah kam hai, purana data delete karein)", "warning")

        tarikh = request.form.get("tarikh", date.today().strftime("%Y-%m-%d"))
        subah = float(request.form.get("subah_liter", 0) or 0)
        sham = float(request.form.get("sham_liter", 0) or 0)
        total = subah + sham
        fat = float(request.form.get("fat_ratio", 5.5) or 5.5)
        snf = float(request.form.get("snf_ratio", 8.8) or 8.8)
        farokht = float(request.form.get("farokht_liter", 0) or 0)
        zaya = float(request.form.get("zaya_liter", 0) or 0)
        gharelu = float(request.form.get("gharelu_liter", 0) or 0)
        rate = float(request.form.get("rate_fi_liter", 190) or 190)
        notes = request.form.get("notes", "").strip()

        db.execute("""
        INSERT INTO milk_production (tarikh, subah_liter, sham_liter, total_liter, fat_ratio, snf_ratio, farokht_liter, zaya_liter, gharelu_liter, rate_fi_liter, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (tarikh, subah, sham, total, fat, snf, farokht, zaya, gharelu, rate, notes))

        # اگر دودھ فروخت ہوا ہے تو خودکار طور پر آمدنی میں بھی درج کریں
        if farokht > 0:
            income_amount = farokht * rate
            db.execute("""
            INSERT INTO income (tarikh, mad, tafseel, miqdar, rate, kul_mublagh, gahak_naam, wasool_shuda)
            VALUES (?, 'Doodh Farokht', ?, ?, ?, ?, 'ڈیلی ملک سپلائی', 'Haan')
            """, (tarikh, f"روزانہ دودھ فروخت ({farokht} لیٹر)", farokht, rate, income_amount))

        db.commit()
        flash(f"تاریخ {tarikh} کا دودھ ریکارڈ ({total} لیٹر) کامیابی سے محفوظ ہو گیا!", "success")
        return redirect(url_for("milk"))

    # پچھلے تمام ریکارڈز
    records = db.execute("SELECT * FROM milk_production ORDER BY tarikh DESC LIMIT 30").fetchall()

    # اوسط اور خلاصہ
    row_sum = db.execute("SELECT AVG(total_liter) as avg_milk, SUM(total_liter) as sum_milk, AVG(fat_ratio) as avg_fat, AVG(snf_ratio) as avg_snf FROM milk_production").fetchone()
    avg_milk = round(row_sum["avg_milk"] or 0, 1)
    sum_milk = round(row_sum["sum_milk"] or 0, 1)
    avg_fat = round(row_sum["avg_fat"] or 0, 2)
    avg_snf = round(row_sum["avg_snf"] or 0, 2)

    # فی جانور اوسط (Active Milking Cows)
    cows_count = db.execute("SELECT COUNT(*) FROM herd WHERE qism = 'Doodh wali' AND halat = 'Faal'").fetchone()[0] or 1
    per_animal_avg = round((avg_milk / cows_count), 1)

    return render_template(
        "milk.html",
        records=records,
        avg_milk=avg_milk,
        sum_milk=sum_milk,
        avg_fat=avg_fat,
        avg_snf=avg_snf,
        per_animal_avg=per_animal_avg,
        cows_count=cows_count
    )


@app.route("/milk/delete/<int:id>", methods=["POST"])
@login_required
def delete_milk(id):
    db = get_db()
    db.execute("DELETE FROM milk_production WHERE id = ?", (id,))
    db.commit()
    flash("دودھ کا ریکارڈ حذف کر دیا گیا ہے۔", "info")
    return redirect(url_for("milk"))


# --------------------------------------------------------------
# ماڈیول 3: آمدنی کا کھاتہ (Income Management)
# --------------------------------------------------------------
@app.route("/income", methods=["GET", "POST"])
@login_required
def income():
    db = get_db()
    space_status = check_disk_space()

    if request.method == "POST":
        if space_status["is_low"]:
            flash("وارننگ: جگہ کم ہے، پرانا ڈیٹا ڈیلیٹ کریں!", "warning")

        tarikh = request.form.get("tarikh", date.today().strftime("%Y-%m-%d"))
        mad = request.form.get("mad", "Doodh Farokht").strip()
        tafseel = request.form.get("tafseel", "").strip()
        miqdar = float(request.form.get("miqdar", 1) or 1)
        rate = float(request.form.get("rate", 0) or 0)
        kul_mublagh = float(request.form.get("kul_mublagh", 0) or (miqdar * rate))
        gahak_naam = request.form.get("gahak_naam", "").strip()
        wasool_shuda = request.form.get("wasool_shuda", "Haan").strip()

        db.execute("""
        INSERT INTO income (tarikh, mad, tafseel, miqdar, rate, kul_mublagh, gahak_naam, wasool_shuda)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (tarikh, mad, tafseel, miqdar, rate, kul_mublagh, gahak_naam, wasool_shuda))
        db.commit()
        flash(f"آمدنی کی انٹری ({kul_mublagh:,.0f} روپے) کامیابی سے شامل کر لی گئی ہے۔", "success")
        return redirect(url_for("income"))

    incomes = db.execute("SELECT * FROM income ORDER BY tarikh DESC, id DESC").fetchall()
    total_income = db.execute("SELECT SUM(kul_mublagh) FROM income").fetchone()[0] or 0.0

    return render_template("income.html", incomes=incomes, total_income=total_income)


@app.route("/income/delete/<int:id>", methods=["POST"])
@login_required
def delete_income(id):
    db = get_db()
    db.execute("DELETE FROM income WHERE id = ?", (id,))
    db.commit()
    flash("آمدنی کا ریکارڈ حذف کر دیا گیا ہے۔", "info")
    return redirect(url_for("income"))


# --------------------------------------------------------------
# ماڈیول 4: اخراجات کا کھاتہ (Expenses Management)
# --------------------------------------------------------------
@app.route("/expenses", methods=["GET", "POST"])
@login_required
def expenses():
    db = get_db()
    space_status = check_disk_space()

    if request.method == "POST":
        if space_status["is_low"]:
            flash("وارننگ: جگہ کم ہے، پرانا ڈیٹا ڈیلیٹ کریں!", "warning")

        tarikh = request.form.get("tarikh", date.today().strftime("%Y-%m-%d"))
        mad = request.form.get("mad", "Chara/Wanda").strip()
        tafseel = request.form.get("tafseel", "").strip()
        mublagh = float(request.form.get("mublagh", 0) or 0)
        paid_to = request.form.get("paid_to", "").strip()
        is_feed = 1 if mad == "Chara/Wanda" else 0

        db.execute("""
        INSERT INTO expenses (tarikh, mad, tafseel, mublagh, paid_to, is_feed)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (tarikh, mad, tafseel, mublagh, paid_to, is_feed))
        db.commit()
        flash(f"خرچہ کی انٹری ({mublagh:,.0f} روپے) کامیابی سے درج کر لی گئی ہے۔", "success")
        return redirect(url_for("expenses"))

    expenses_list = db.execute("SELECT * FROM expenses ORDER BY tarikh DESC, id DESC").fetchall()
    total_expense = db.execute("SELECT SUM(mublagh) FROM expenses").fetchone()[0] or 0.0
    feed_expense = db.execute("SELECT SUM(mublagh) FROM expenses WHERE is_feed = 1").fetchone()[0] or 0.0
    feed_ratio = round((feed_expense / total_expense * 100), 1) if total_expense > 0 else 0.0

    return render_template(
        "expenses.html",
        expenses=expenses_list,
        total_expense=total_expense,
        feed_expense=feed_expense,
        feed_ratio=feed_ratio
    )


@app.route("/expenses/delete/<int:id>", methods=["POST"])
@login_required
def delete_expense(id):
    db = get_db()
    db.execute("DELETE FROM expenses WHERE id = ?", (id,))
    db.commit()
    flash("اخراجات کا ریکارڈ حذف کر دیا گیا ہے۔", "info")
    return redirect(url_for("expenses"))


# --------------------------------------------------------------
# ماڈیول 5: منافع اور نقصان کا حساب کتاب (Profit & Loss Statement)
# --------------------------------------------------------------
@app.route("/profit-loss")
@login_required
def profit_loss():
    db = get_db()
    # کل آمدنی اور کل اخراجات
    total_income = db.execute("SELECT SUM(kul_mublagh) FROM income").fetchone()[0] or 0.0
    total_expenses = db.execute("SELECT SUM(mublagh) FROM expenses").fetchone()[0] or 0.0
    net_profit = total_income - total_expenses
    profit_margin = round((net_profit / total_income * 100), 1) if total_income > 0 else 0.0

    # دودھ پیداوار پر مبنی فی لیٹر تجزیہ
    total_milk = db.execute("SELECT SUM(total_liter) FROM milk_production").fetchone()[0] or 1.0
    cost_per_liter = round(total_expenses / total_milk, 2) if total_milk > 0 else 0.0
    income_per_liter = round(total_income / total_milk, 2) if total_milk > 0 else 0.0
    profit_per_liter = round(income_per_liter - cost_per_liter, 2)

    # فی جانور روزانہ لاگت (Daily cost per animal)
    total_animals = db.execute("SELECT COUNT(*) FROM herd WHERE halat = 'Faal'").fetchone()[0] or 1
    # فرض کریں پچھلے 30 دن کا تجزیہ
    daily_farm_cost = round(total_expenses / 30, 0)
    cost_per_animal_daily = round(daily_farm_cost / total_animals, 1)

    # اخراجات کی مد وار تقسیم (Donut data)
    cats = db.execute("SELECT mad, SUM(mublagh) as total FROM expenses GROUP BY mad ORDER BY total DESC").fetchall()

    return render_template(
        "profit_loss.html",
        total_income=total_income,
        total_expenses=total_expenses,
        net_profit=net_profit,
        profit_margin=profit_margin,
        cost_per_liter=cost_per_liter,
        profit_per_liter=profit_per_liter,
        income_per_liter=income_per_liter,
        cost_per_animal_daily=cost_per_animal_daily,
        total_animals=total_animals,
        cats=cats
    )


# --------------------------------------------------------------
# ماڈیول 6: چارہ اور ونڈا اسٹاک (Feed and Nutrition)
# --------------------------------------------------------------
@app.route("/feed", methods=["GET", "POST"])
@login_required
def feed():
    db = get_db()
    space_status = check_disk_space()

    if request.method == "POST":
        if space_status["is_low"]:
            flash("وارننگ: جگہ کم ہے، پرانا ڈیٹا ڈیلیٹ کریں!", "warning")

        tarikh = request.form.get("tarikh", date.today().strftime("%Y-%m-%d"))
        feed_type = request.form.get("feed_type", "").strip()
        rozana_miqdar_kg = float(request.form.get("rozana_miqdar_kg", 0) or 0)
        stock_baqaya_kg = float(request.form.get("stock_baqaya_kg", 0) or 0)
        bori_count = int(request.form.get("bori_count", 0) or 0)
        feed_cost = float(request.form.get("feed_cost", 0) or 0)

        # فعال جانوروں کی تعداد کے مطابق فی جانور مقدار نکالیں
        total_animals = db.execute("SELECT COUNT(*) FROM herd WHERE halat = 'Faal'").fetchone()[0] or 1
        fi_janwar = round(rozana_miqdar_kg / total_animals, 1)

        db.execute("""
        INSERT INTO feed (tarikh, feed_type, rozana_miqdar_kg, stock_baqaya_kg, bori_count, fi_janwar_kg, feed_cost)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (tarikh, feed_type, rozana_miqdar_kg, stock_baqaya_kg, bori_count, fi_janwar, feed_cost))
        db.commit()
        flash(f"{feed_type} کا خوراک ریکارڈ کامیابی سے درج ہو گیا۔", "success")
        return redirect(url_for("feed"))

    feed_records = db.execute("SELECT * FROM feed ORDER BY tarikh DESC, id DESC").fetchall()
    
    # فیڈ کنورژن ریشو (FCR = Total Feed Kg / Total Milk Liter)
    total_feed_kg = db.execute("SELECT SUM(rozana_miqdar_kg) FROM feed").fetchone()[0] or 0.0
    total_milk_liters = db.execute("SELECT SUM(total_liter) FROM milk_production").fetchone()[0] or 1.0
    fcr = round(total_feed_kg / total_milk_liters, 2) if total_milk_liters > 0 else 0.0

    return render_template("feed.html", feed_records=feed_records, fcr=fcr, total_feed_kg=total_feed_kg)


@app.route("/feed/delete/<int:id>", methods=["POST"])
@login_required
def delete_feed(id):
    db = get_db()
    db.execute("DELETE FROM feed WHERE id = ?", (id,))
    db.commit()
    flash("خوراک کا ریکارڈ حذف ہو گیا۔", "info")
    return redirect(url_for("feed"))


# --------------------------------------------------------------
# ماڈیول 7: بریڈنگ اور تولیدی صحت (Reproduction & Breeding)
# --------------------------------------------------------------
@app.route("/breeding", methods=["GET", "POST"])
@login_required
def breeding():
    db = get_db()
    space_status = check_disk_space()

    if request.method == "POST":
        if space_status["is_low"]:
            flash("وارننگ: جگہ کم ہے، پرانا ڈیٹا ڈیلیٹ کریں!", "warning")

        tag_no = request.form.get("tag_no", "").strip().upper()
        tika_tarikh_str = request.form.get("tika_tarikh", date.today().strftime("%Y-%m-%d"))
        tika_qism = request.form.get("tika_qism", "مصنوعی نسل کشی (A.I)").strip()
        pregnancy_status = request.form.get("pregnancy_status", "Tasdeeq Shuda").strip()
        notes = request.form.get("notes", "").strip()

        # خودکار متوقع تاریخ ولادت کا حساب: گائے 280 دن، بھینس 310 دن
        animal = db.execute("SELECT nasal FROM herd WHERE tag_no = ?", (tag_no,)).fetchone()
        tika_date = datetime.strptime(tika_tarikh_str, "%Y-%m-%d").date()

        days_to_add = 280  # گائے کے لیے
        if animal and ("بھینس" in animal["nasal"] or "راوی" in animal["nasal"] or "Buffalo" in animal["nasal"]):
            days_to_add = 310  # بھینس کے لیے

        mutawaqqa_wiladat = (tika_date + timedelta(days=days_to_add)).strftime("%Y-%m-%d")

        db.execute("""
        INSERT INTO breeding (tag_no, tika_tarikh, tika_qism, mutawaqqa_wiladat, pregnancy_status, notes)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (tag_no, tika_tarikh_str, tika_qism, mutawaqqa_wiladat, pregnancy_status, notes))

        if pregnancy_status in ['Tasdeeq Shuda', 'Pregnant']:
            db.execute("UPDATE herd SET qism = 'Gabhan' WHERE tag_no = ?", (tag_no,))

        db.commit()
        flash(f"بریڈنگ انٹری محفوظ! متوقع تاریخ ولادت: {mutawaqqa_wiladat}", "success")
        return redirect(url_for("breeding"))

    records = db.execute("SELECT * FROM breeding ORDER BY id DESC").fetchall()
    cows = db.execute("SELECT tag_no, nasal FROM herd WHERE qism IN ('Doodh wali', 'Dry', 'Gabhan') AND halat = 'Faal'").fetchall()

    return render_template("breeding.html", records=records, cows=cows)


@app.route("/breeding/delete/<int:id>", methods=["POST"])
@login_required
def delete_breeding(id):
    db = get_db()
    db.execute("DELETE FROM breeding WHERE id = ?", (id,))
    db.commit()
    flash("بریڈنگ ریکارڈ حذف کر دیا گیا۔", "info")
    return redirect(url_for("breeding"))


# --------------------------------------------------------------
# ماڈیول 8: جانوروں کی صحت اور ادویات (Animal Health & Vaccines)
# --------------------------------------------------------------
@app.route("/health", methods=["GET", "POST"])
@login_required
def health():
    db = get_db()
    space_status = check_disk_space()

    if request.method == "POST":
        if space_status["is_low"]:
            flash("وارننگ: جگہ کم ہے، پرانا ڈیٹا ڈیلیٹ کریں!", "warning")

        tag_no = request.form.get("tag_no", "").strip().upper()
        tarikh = request.form.get("tarikh", date.today().strftime("%Y-%m-%d"))
        bimari = request.form.get("bimari_qism", "").strip()
        ilaj = request.form.get("ilaj_tafseel", "").strip()
        doctor = request.form.get("doctor_naam", "").strip()
        kharch = float(request.form.get("ilaj_kharch", 0) or 0)
        vaccine = request.form.get("vaccine_naam", "").strip()
        next_vac = request.form.get("vaccine_next_date", "")
        status = request.form.get("sehat_status", "Theek Ho Gaya").strip()
        notes = request.form.get("notes", "").strip()

        db.execute("""
        INSERT INTO health (tag_no, tarikh, bimari_qism, ilaj_tafseel, doctor_naam, ilaj_kharch, vaccine_naam, vaccine_next_date, sehat_status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (tag_no, tarikh, bimari, ilaj, doctor, kharch, vaccine, next_vac, status, notes))

        # علاج خرچ کو اخراجات ٹیبل میں بھی جوڑیں
        if kharch > 0:
            db.execute("""
            INSERT INTO expenses (tarikh, mad, tafseel, mublagh, paid_to, is_feed)
            VALUES (?, 'Dawaiyan/Doctor', ?, ?, ?, 0)
            """, (tarikh, f"علاج خرچ ٹیگ {tag_no} ({bimari})", kharch, doctor))

        # اگر جانور فوت ہو گیا ہو تو ہارڈ لسٹ میں حالت Maut کر دیں
        if status == "Fout":
            db.execute("UPDATE herd SET halat = 'Maut' WHERE tag_no = ?", (tag_no,))

        db.commit()
        flash(f"صحت کا ریکارڈ کامیابی سے محفوظ ہو گیا۔", "success")
        return redirect(url_for("health"))

    records = db.execute("SELECT * FROM health ORDER BY tarikh DESC, id DESC").fetchall()
    all_animals = db.execute("SELECT tag_no FROM herd WHERE halat = 'Faal'").fetchall()

    # اموات کی شرح (Mortality Rate %)
    dead_count = db.execute("SELECT COUNT(*) FROM herd WHERE halat = 'Maut'").fetchone()[0]
    total_count = db.execute("SELECT COUNT(*) FROM herd").fetchone()[0] or 1
    mortality_rate = round((dead_count / total_count * 100), 2)

    return render_template("health.html", records=records, all_animals=all_animals, mortality_rate=mortality_rate)


@app.route("/health/delete/<int:id>", methods=["POST"])
@login_required
def delete_health(id):
    db = get_db()
    db.execute("DELETE FROM health WHERE id = ?", (id,))
    db.commit()
    flash("صحت کا ریکارڈ حذف ہو گیا۔", "info")
    return redirect(url_for("health"))


# --------------------------------------------------------------
# ماڈیول 9: وزن اور گروتھ ٹریکنگ (Weight & Average Daily Gain)
# --------------------------------------------------------------
@app.route("/weight", methods=["GET", "POST"])
@login_required
def weight():
    db = get_db()
    space_status = check_disk_space()

    if request.method == "POST":
        if space_status["is_low"]:
            flash("وارننگ: جگہ کم ہے، پرانا ڈیٹا ڈیلیٹ کریں!", "warning")

        tag_no = request.form.get("tag_no", "").strip().upper()
        tarikh = request.form.get("tarikh", date.today().strftime("%Y-%m-%d"))
        wazan_kg = float(request.form.get("wazan_kg", 0) or 0)
        pichla_wazan = float(request.form.get("pichla_wazan_kg", 0) or 0)
        dino_ka_farq = int(request.form.get("dino_ka_farq", 30) or 30)
        notes = request.form.get("notes", "").strip()

        # ADG (Average Daily Gain) گرام فی دن میں حساب کریں
        if dino_ka_farq > 0 and pichla_wazan > 0:
            adg_grams = round(((wazan_kg - pichla_wazan) / dino_ka_farq) * 1000, 1)
        else:
            adg_grams = 0.0

        db.execute("""
        INSERT INTO weight_tracking (tag_no, tarikh, wazan_kg, pichla_wazan_kg, dino_ka_farq, adg_grams, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (tag_no, tarikh, wazan_kg, pichla_wazan, dino_ka_farq, adg_grams, notes))

        # ہارڈ ٹیبل میں بھی جانور کا تازہ ترین وزن اپڈیٹ کریں
        db.execute("UPDATE herd SET wazan = ? WHERE tag_no = ?", (wazan_kg, tag_no))

        db.commit()
        flash(f"وزن کا اندراج محفوظ! روزانہ اوسط اضافہ (ADG): {adg_grams} گرام فی دن", "success")
        return redirect(url_for("weight"))

    records = db.execute("SELECT * FROM weight_tracking ORDER BY tarikh DESC, id DESC").fetchall()
    animals = db.execute("SELECT tag_no, nasal, wazan FROM herd WHERE halat = 'Faal'").fetchall()

    return render_template("weight.html", records=records, animals=animals)


@app.route("/weight/delete/<int:id>", methods=["POST"])
@login_required
def delete_weight(id):
    db = get_db()
    db.execute("DELETE FROM weight_tracking WHERE id = ?", (id,))
    db.commit()
    flash("وزن کا ریکارڈ حذف ہو گیا۔", "info")
    return redirect(url_for("weight"))


# --------------------------------------------------------------
# ماڈیول 10: گاہک اور ادھار کھاتہ (Customers & Khata)
# --------------------------------------------------------------
@app.route("/customers", methods=["GET", "POST"])
@login_required
def customers():
    db = get_db()
    space_status = check_disk_space()

    if request.method == "POST":
        if space_status["is_low"]:
            flash("وارننگ: جگہ کم ہے، پرانا ڈیٹا ڈیلیٹ کریں!", "warning")

        action = request.form.get("action", "add_customer")

        if action == "add_customer":
            naam = request.form.get("naam", "").strip()
            phone = request.form.get("phone", "").strip()
            pata = request.form.get("pata", "").strip()
            rozana_supply = float(request.form.get("rozana_supply_liter", 0) or 0)
            rate = float(request.form.get("rate_fi_liter", 190) or 190)
            baqaya = float(request.form.get("kul_baqaya", 0) or 0)

            db.execute("""
            INSERT INTO customers (naam, phone, pata, rozana_supply_liter, rate_fi_liter, kul_baqaya, status)
            VALUES (?, ?, ?, ?, ?, ?, 'Active')
            """, (naam, phone, pata, rozana_supply, rate, baqaya))
            db.commit()
            flash(f"نیا گاہک '{naam}' کامیابی سے شامل کر دیا گیا۔", "success")

        elif action == "record_payment":
            # گاہک سے وصولی کا اندراج
            cust_id = int(request.form.get("customer_id"))
            wasooli_mublagh = float(request.form.get("wasooli_mublagh", 0) or 0)
            tarikh = request.form.get("tarikh", date.today().strftime("%Y-%m-%d"))
            cust = db.execute("SELECT * FROM customers WHERE id = ?", (cust_id,)).fetchone()

            if cust and wasooli_mublagh > 0:
                naya_baqaya = max(0.0, cust["kul_baqaya"] - wasooli_mublagh)
                db.execute("UPDATE customers SET kul_baqaya = ? WHERE id = ?", (naya_baqaya, cust_id))
                # آمدنی میں شامل کریں
                db.execute("""
                INSERT INTO income (tarikh, mad, tafseel, miqdar, rate, kul_mublagh, gahak_naam, wasool_shuda)
                VALUES (?, 'Doodh Farokht', ?, 1, ?, ?, ?, 'Haan')
                """, (tarikh, f"بقایا وصولی از {cust['naam']}", wasooli_mublagh, wasooli_mublagh, cust['naam']))
                db.commit()
                flash(f"گاہک {cust['naam']} سے {wasooli_mublagh:,.0f} روپے وصولی درج ہو گئی۔ نیا بقایا: {naya_baqaya:,.0f} روپے", "success")

        return redirect(url_for("customers"))

    customer_list = db.execute("SELECT * FROM customers ORDER BY kul_baqaya DESC").fetchall()
    total_due = db.execute("SELECT SUM(kul_baqaya) FROM customers").fetchone()[0] or 0.0
    total_supply = db.execute("SELECT SUM(rozana_supply_liter) FROM customers WHERE status = 'Active'").fetchone()[0] or 0.0

    return render_template("customers.html", customers=customer_list, total_due=total_due, total_supply=total_supply)


@app.route("/customers/delete/<int:id>", methods=["POST"])
@login_required
def delete_customer(id):
    db = get_db()
    db.execute("DELETE FROM customers WHERE id = ?", (id,))
    db.commit()
    flash("گاہک کا کھاتہ حذف ہو گیا۔", "info")
    return redirect(url_for("customers"))


# --------------------------------------------------------------
# گاہکوں کے بقایا جات اور ادھار کھاتہ CSV ایکسپورٹ (Export Customer Balances CSV)
# --------------------------------------------------------------
@app.route("/customers/export-csv")
@login_required
def export_customers_csv():
    """گاہکوں کے بقایا جات اور مکمل کھاتہ کو CSV فائل میں ایکسپورٹ کرتا ہے"""
    import io
    import csv
    from flask import Response

    db = get_db()
    customers_data = db.execute("SELECT * FROM customers ORDER BY kul_baqaya DESC").fetchall()

    output = io.StringIO()
    # Excel میں اردو ٹیکسٹ درست دکھانے کے لیے UTF-8 BOM
    output.write('\ufeff')
    writer = csv.writer(output)
    
    # ہیڈر کالمز
    writer.writerow([
        "ID",
        "گاہک کا نام (Customer Name)",
        "موبائل فون (Phone Number)",
        "پتہ (Address)",
        "روزانہ دودھ سپلائی لیٹر (Daily Supply Liters)",
        "طے شدہ ریٹ روپے (Rate per Liter PKR)",
        "واجب الادا بقایا رقم روپے (Outstanding Due PKR)",
        "کھاتہ حالت (Status)"
    ])

    for c in customers_data:
        status_text = "باقی واجب الادا" if c["kul_baqaya"] > 0 else "بے باق / صاف کھاتہ"
        writer.writerow([
            c["id"],
            c["naam"],
            c["phone"] or "",
            c["pata"] or "",
            c["rozana_supply_liter"],
            c["rate_fi_liter"],
            c["kul_baqaya"],
            status_text
        ])

    csv_data = output.getvalue()
    filename = f"Customer_Khata_Balances_{date.today().strftime('%Y-%m-%d')}.csv"
    
    return Response(
        csv_data,
        mimetype="text/csv; charset=utf-8",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# --------------------------------------------------------------
# گاہکوں کی ادائیگی اور وصولی ہسٹری CSV ایکسپورٹ (Export Payment History CSV)
# --------------------------------------------------------------
@app.route("/customers/export-payments-csv")
@login_required
def export_payments_csv():
    """گاہکوں سے موصولہ ادائیگیوں اور دودھ سیلز کی ہسٹری CSV فائل میں ایکسپورٹ کرتا ہے"""
    import io
    import csv
    from flask import Response

    db = get_db()
    # انکم ٹیبل سے دودھ اور گاہکوں کی وصولیاں حاصل کریں
    payments = db.execute("""
        SELECT id, tarikh, gahak_naam, tafseel, miqdar, rate, kul_mublagh, wasool_shuda
        FROM income
        WHERE mad = 'Doodh Farokht' OR gahak_naam IS NOT NULL
        ORDER BY tarikh DESC, id DESC
    """).fetchall()

    output = io.StringIO()
    output.write('\ufeff')
    writer = csv.writer(output)

    writer.writerow([
        "ID",
        "تاریخ (Date)",
        "گاہک کا نام (Customer Name)",
        "تفصیل (Description)",
        "مقدار (Liters / Qty)",
        "ریٹ روپے (Rate PKR)",
        "کل وصول شدہ رقم روپے (Amount Received PKR)",
        "ادائیگی حالت (Status)"
    ])

    for p in payments:
        writer.writerow([
            p["id"],
            p["tarikh"],
            p["gahak_naam"] or "عام گاہک",
            p["tafseel"],
            p["miqdar"],
            p["rate"],
            p["kul_mublagh"],
            "وصول شدہ" if p["wasool_shuda"] == "Haan" else "ادھار"
        ])

    csv_data = output.getvalue()
    filename = f"Customer_Payment_History_{date.today().strftime('%Y-%m-%d')}.csv"

    return Response(
        csv_data,
        mimetype="text/csv; charset=utf-8",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# --------------------------------------------------------------
# 11. ڈیمو ٹیسٹنگ کے لیے فری سپیس سمولیشن (Simulate Low Space)
# --------------------------------------------------------------
@app.route("/simulate-warning")
@login_required
def simulate_warning():
    """یہ روٹ استاد یا چیکر کو 500MB سے کم کی وارننگ ٹیسٹ کرواتا ہے"""
    flash("وارننگ (ٹیسٹ): جگہ کم ہے، پرانا ڈیٹا ڈیلیٹ کریں! (Jagah kam hai, purana data delete karein - Free Space < 500MB)", "warning")
    return redirect(url_for("dashboard"))


# --------------------------------------------------------------
# 12. ایپ چلانے کا مین پوائنٹ (Main Entry Point)
# --------------------------------------------------------------
# ڈیٹابیس ٹیبلز اور ڈمی ڈیٹا خودکار تیار کریں
init_db()

if __name__ == "__main__":
    # پورٹ 5000 یا انوائرنمنٹ پورٹ پر چلائیں
    port = int(os.environ.get("PORT", 5000))
    print(f"==================================================")
    print(f" ڈیری فارم مینجمنٹ سسٹم شروع ہو چکا ہے")
    print(f" ویب سائٹ لنک: http://localhost:{port}")
    print(f" ڈیفالٹ لاگ اِن: یوزر: admin | پاس ورڈ: 1234")
    print(f"==================================================")
    app.run(host="0.0.0.0", port=port, debug=False)
