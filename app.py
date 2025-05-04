from flask import Flask, render_template, request, redirect, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text, Index
from datetime import datetime
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)

# this specifies which database should be used for the website
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///fitness.db"
# This will show all warnings but if False, it will not show all the warnings
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = True

# allows flask app to utilize and change the database (creates connection)
# initializiation
db = SQLAlchemy(app)

CORS(app)

class UserInformation(db.Model):
    # specify name of table just like in SQLInCode slide 21
    __tablename__ = 'UserInformation'
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(50), nullable=False)

class PersonalTrainer(db.Model):
    __tablename__ = 'PersonalTrainer'
    id = db.Column(db.Integer, db.ForeignKey('UserInformation.id'), primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)

class PT_Meeting(db.Model):
    __tablename__ = 'pt_meeting'
    meeting_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('UserInformation.id'))
    trainer_id = db.Column(db.Integer, db.ForeignKey('PersonalTrainer.id'))
    day = db.Column(db.DateTime, nullable=False)

class PersonalTracker(db.Model):
    __tablename__ = 'PersonalTracker'
    workout_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('UserInformation.id'))
    date = db.Column(db.DateTime, default=datetime.today())
    bench_press = db.Column(db.Integer, default=0)
    incline_dumbell_press = db.Column(db.Integer, default=0)
    flat_dumbell_press = db.Column(db.Integer, default=0)
    squat = db.Column(db.Integer, default=0)
    deadlift = db.Column(db.Integer, default=0)
    seated_row = db.Column(db.Integer, default=0)

class FoodTracker(db.Model):
    __tablename__ = "FoodTracker"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('UserInformation.id'))
    day = db.Column(db.DateTime, default=datetime.today())
    calorie = db.Column(db.Integer, default=0)
    protein = db.Column(db.Integer, default=0)
    carb = db.Column(db.Integer, default=0)
    fat = db.Column(db.Integer, default=0)


    __table_args__ = (
        Index('idx_protein', 'protein'),
        Index('idx_date', 'day'),
    )

with app.app_context():
    #db.drop_all()
    db.create_all()

@app.route("/track/food", methods=["GET"])
def track_nutrition():
    track_food_data = db.session.query(FoodTracker).all()
    
    # error shows up if I try to print just track_food_data
    # so making it a dictionary instead to print
    temp_dict = {}
    temp_arr = []
    count = 0
    for x in track_food_data:
        temp_dict = {
            "id": x.id, 
            "user_id": x.user_id, 
            "day": x.day, 
            "calorie": x.calorie, 
            "protein": x.protein, 
            "carb": x.carb, 
            "fat": x.fat
        }
        temp_arr.append(temp_dict)
    print(temp_arr)
    return jsonify(temp_arr)

@app.route("/add/meal", methods=["POST"])
def add_meal():
    data = request.get_json()

    user_id = data["userid"]
    #date = data["date"]
    calorie = data["calorie"]
    protein = data["protein"]
    carb = data["carb"]
    fat = data["fat"]

    new_meal = FoodTracker(user_id=user_id, calorie=calorie, protein=protein, carb=carb, fat=fat)
    db.session.add(new_meal)
    db.session.commit()

    return jsonify({"message": "Successfully added meal!"})



@app.route("/delete/meal/<int:meal_id>", methods=["DELETE"])
def delete_meal(meal_id):
    data = db.session.query(FoodTracker).get(meal_id)
    print(data)
    if data is None:
        return jsonify({"message": "The meal was not found."})
    
    db.session.delete(data)
    db.session.commit()

    return jsonify({"message": "Deletion successful!"})
    




@app.route("/update/meal/<int:mealID>", methods=["PUT"])
def update_meal(mealID):
    data = db.session.query(FoodTracker).get(mealID)
    if data is None:
        return jsonify({"message": "The meal was not found."})
    
    # get the data from the frontend
    front_data = request.get_json()

    data.user_id = front_data["user_id"]

    # maybe yes or no question with date?

    data.calorie = front_data["calorie"]
    data.protein = front_data["protein"]
    data.carb = front_data["carb"]
    data.fat = front_data["fat"]
    db.session.commit()

    jsonify({"message": "Update Successful!"})

    return jsonify([{
        "id": data.id,
        "user_id": data.user_id,
        "day": data.day,
        "calorie": data.calorie,
        "protein": data.protein,
        "carb": data.carb,
        "fat": data.fat
    }])


# sends all of the unique users to the frontend to populate the drop down list
@app.route("/dropdownGET", methods=["GET"])
def getUsers_DropDown():
    all_users = db.session.execute(
        text("SELECT DISTINCT user_id FROM FoodTracker")
    ).fetchall()


    temp_arr = []
    # without array, it would only show the last user inputted
    for user in all_users:
        temp_dict = {}
        temp_dict["user_id"] = user[0]
        temp_arr.append(temp_dict)

    return jsonify(temp_arr)


@app.route("/dropdown/<int:input_user_id>", methods=['GET'])
def dropdownlist(input_user_id):
    specific_user = db.session.execute(
        text("SELECT * FROM FoodTracker WHERE user_id = :user_id"),
        {"user_id": input_user_id}
    ).fetchall()

    if specific_user is None:
        return jsonify({"message": "data for user could not be found."})
    
    temp_arr = []
    temp_dict = {}
    for row in specific_user:
        temp_dict = {}
        temp_dict["id"] = row[0]
        temp_dict["user_id"] = row[1]
        temp_dict["day"] = row[2]
        temp_dict["calorie"] = row[3]
        temp_dict["protein"] = row[4]
        temp_dict["carb"] = row[5]
        temp_dict["fat"] = row[6]
        temp_arr.append(temp_dict)

    return jsonify(temp_arr)





@app.route("/ProteinRange", methods=["POST"])
def protein_range():
    # if request.form['min_protein'] is None or request.form['max_protein'] is None:
    #     return jsonify({"message": "Incorrect protein amount received."})
    
    returned_data = request.get_json()
    print(returned_data)

    min_protein = int(returned_data['min_protein'])
    max_protein = int(returned_data['max_protein'])

    all_rows = db.session.execute(
        text("SELECT * FROM FoodTracker WHERE protein >= :min_protein AND protein <= :max_protein"),
        {'min_protein': min_protein, 'max_protein': max_protein}
    ).fetchall()
    
    temp_arr = []
    temp_dict = {}
    for row in all_rows:
        temp_dict = {}
        temp_dict["id"] = row[0]
        temp_dict["user_id"] = row[1]
        temp_dict["day"] = row[2]
        temp_dict["calorie"] = row[3]
        temp_dict["protein"] = row[4]
        temp_dict["carb"] = row[5]
        temp_dict["fat"] = row[6]
        temp_arr.append(temp_dict)

    return jsonify(temp_arr)



@app.route("/DateRange", methods=["POST"])
def date_range():
    returned_data = request.get_json()

    min_date = returned_data["min_date"]
    max_date = returned_data["max_date"]

    all_rows = db.session.execute(
        text("SELECT * FROM FoodTracker WHERE DATE(day) >= :min_date AND DATE(day) <= :max_date"),
        {"min_date": min_date, "max_date": max_date}
    )

    temp_arr = []
    temp_dict = {}
    for row in all_rows:
        temp_dict = {}
        temp_dict["id"] = row[0]
        temp_dict["user_id"] = row[1]
        temp_dict["day"] = row[2]
        temp_dict["calorie"] = row[3]
        temp_dict["protein"] = row[4]
        temp_dict["carb"] = row[5]
        temp_dict["fat"] = row[6]
        temp_arr.append(temp_dict)

    return jsonify(temp_arr)


if __name__ == "__main__":
    app.run(debug=True)