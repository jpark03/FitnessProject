from app import db, app, UserInformation, PersonalTrainer, PT_Meeting, PersonalTracker, FoodTracker

with app.app_context():
    me_user = UserInformation(first_name = "John", last_name = "Po", email = "JohnPo@gmail.com")
    pt_user = UserInformation(first_name = "Peter", last_name = "Park", email = "PeterPark@gmail.com")
    db.session.add(me_user)
    db.session.add(pt_user)
    db.session.commit()

    # pt1 = PersonalTrainer(id = pt_user.id, first_name = "Peter", last_name = "Park")
    # db.session.add(pt1)
    # db.session.commit()

    meal1 = FoodTracker(user_id = me_user.id, calorie = 500, protein = 40, carb = 50, fat = 30)
    meal2 = FoodTracker(user_id = me_user.id, calorie = 400, protein = 5, carb = 30, fat = 20)
    db.session.add(meal1)
    db.session.add(meal2)
    db.session.commit()
    