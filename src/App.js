import React, {useState, useEffect} from 'react'
import './App.css'

function App() {
  const [main_data, setData] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/track/food")
    .then(res => res.json())
    .then(data => {
      setData(data)
      console.log(data)
    })
  }, []);





  const[userid, setUserID] = useState("");
  const [calorie, setCalorie] = useState("");
  const [protein, setProtein] = useState("");
  const [carb, setCarb] = useState("");
  const [fat, setFat] = useState("");

  const submitData = async (e) => {
    e.preventDefault();
    const dataToAdd = {
      userid, calorie, protein, carb, fat
    }

    const response = await fetch("http://127.0.0.1:5000/add/meal", 
      {method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(dataToAdd)
      }
    );

    const error = await response.json();
    console.log(error.message);
  };






  const [delmeal, setDeleteMeal] = useState("")
  const [message, setMessage] = useState("")

  /* Problem was that delmeal is already a string so putting it inside the fetch link will keep it a string instead of int */
  const deleteMeal = () => {
    fetch('http://127.0.0.1:5000/delete/meal/' + delmeal, {method: "DELETE"})
    .then(res => res.json())
    .then(data => {
      console.log(main_data)
      /* because the flask method is returning a message, you want to set react message */
      setMessage(data.message)
      if (data.message === "Deletion successful!") {
        /* get all the ids that are not the deleted id */
        setData(main_data.filter(row => row.id !== parseInt(delmeal)))
      }
    });
  }





    const [up_meal, setUpdateMeal] = useState("");
    const [new_userid, setNewUser] = useState("");
    const [new_calorie, setNewCalorie] = useState("");
    const [new_protein, setNewProtein] = useState("");
    const [new_carb, setNewCarb] = useState("");
    const [new_fat, setNewFat] = useState("");


    const updateMeal = () => {
      fetch("http://127.0.0.1:5000/update/meal/" + up_meal, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          user_id: new_userid,
          calorie: new_calorie,
          protein: new_protein,
          carb: new_carb,
          fat: new_fat
        })
      })
      .then(res => res.json())
      .then(data => {
        setData(main_data.map(meal => 
          meal.id === up_meal.id ? up_meal : meal
        ));
      });
    }


    




    const [distinctUsers, setDistinctUsers] = useState([]);
    const [specificUser, setSpecificUser] = useState([]);

    // going to get all of the unique users that exist in the FoodTracker table
    useEffect(() => {
      fetch("http://127.0.0.1:5000/dropdownGET")
      .then(res => res.json())
      .then(data => setDistinctUsers(data))
      .then()
    }, []);

    useEffect(() => {
      const all_or_specific = specificUser ? "http://127.0.0.1:5000/dropdown/"+specificUser : "http://127.0.0.1:5000/track/food"
      fetch(all_or_specific)
      .then(res => res.json())
      .then(data => {setData(data);})   
    }, [specificUser]);

    const userChange = (e) => {
      setSpecificUser(e.target.value);
    };



    const [minProtein, setMinProtein] = useState('')
    const [maxProtein, setMaxProtein] = useState('')

    const handleRangeQuery = async (e) => {
      e.preventDefault()
      const response = await fetch(
        "http://127.0.0.1:5000/ProteinRange",
        {
          method: "POST",
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            min_protein: parseInt(minProtein),
            max_protein: parseInt(maxProtein) 
          })
        }
      );
      const protein_range_data = await response.json();
      setData(protein_range_data)
    }







    const [minDate, setMinDate] = useState('')
    const [maxDate, setMaxDate] = useState('')

    const handleDateRange = async(e) => {
      e.preventDefault()
      const response = await fetch(
        "http://127.0.0.1:5000/DateRange",
        {
          method: "POST",
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            min_date: minDate,
            max_date: maxDate
          })
        }
      );
      const date_range_data = await response.json();
      setData(date_range_data)
    }



    const handleResetMeals = async () => {
      const response = await fetch('http://127.0.0.1:5000/track/food');
      const data = await response.json()
      setData(data)
      setMinDate('')
      setMaxDate('')
      setMaxProtein('')
      setMinProtein('')
    }



  return (
    <div className="App">
      <div className="App-header">
        <h1>Nutrition Website</h1>
        <hr className="header-line"></hr>
      </div>

      <div className="container">
        <table border="1" className="display-table">
          {/* need to do table row for the column names bc it counts as a row */}
          <thead>
            <tr>
              <th>MealID</th>
              <th>UserID</th>
              <th>Date</th>
              <th>Calories</th>
              <th>Protein</th>
              <th>Carbs</th>
              <th>Fat</th>
            </tr>
          </thead>

          {/* when you want to use js within html, {} is needed */}
          <tbody>
            {main_data.map((meal, i, arr) => (
              <tr key={meal.id}>
                <td>{meal.id}</td>
                <td>{meal.user_id}</td>
                <td>{meal.day}</td>
                <td>{meal.calorie}</td>
                <td>{meal.protein}</td>
                <td>{meal.carb}</td>
                <td>{meal.fat}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div>
          <form onSubmit={handleRangeQuery} className="container-form">
            <input
              type="number"
              placeholder="Minimum Protein"
              value={minProtein}
              onChange={(e) => setMinProtein(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Maximum Protein"
              value={maxProtein}
              onChange={(e) => setMaxProtein(e.target.value)}
              required
            />
            <button type="submit">Display Range Query</button>
          </form>
        </div>

        <div>
          <form onSubmit={handleDateRange} className="container-form">
            <input
              type="date"
              value={minDate}
              onChange={(e) => setMinDate(e.target.value)}
            />
            <input
              type="date"
              value={maxDate}
              onChange={(e) => setMaxDate(e.target.value)}
            />
            <button type="submit">Filter by Date</button>
          </form>
        </div>
      </div>
      
      <div className='reset'>
        <label htmlFor="specificUserDropDown" className="label">Choose your user ID:</label>
        <select id="UserID" onChange={userChange} value={specificUser} className="select">
          <option value="">All users</option>
          {distinctUsers.map((user) => (
            <option key={user.user_id} value={user.user_id}>
              {user.user_id}
            </option>
          ))}
        </select>
      </div>

      <div className='reset'>
        <button type="button" onClick={handleResetMeals}>
          Reset to Original Table
        </button>
      </div>

      <div className="crud-form">
        <div className="form-input">
          <h2>Add Meal</h2>
          <form onSubmit={submitData} className="form-col">
            <label>User ID: </label>
            <input
              type="text"
              placeholder="User ID"
              value={userid}
              onChange={(newVal) => setUserID(newVal.target.value)}
            />

            <label>Calories: </label>
            <input
              type="text"
              placeholder="Calories"
              value={calorie}
              onChange={(newVal) => setCalorie(newVal.target.value)}
            />

            <label>Protein: </label>
            <input
              type="text"
              placeholder="Protein"
              value={protein}
              onChange={(newVal) => setProtein(newVal.target.value)}
            />

            <label>Carbs: </label>
            <input
              type="text"
              placeholder="Carbs"
              value={carb}
              onChange={(newVal) => setCarb(newVal.target.value)}
            />

            <label>Fat: </label>
            <input
              type="text"
              placeholder="Fat"
              value={fat}
              onChange={(newVal) => setFat(newVal.target.value)}
            />

            <button type="submit"> Submit </button>
          </form>
        </div>

        <div className="form-input">
          <h2>Delete Meal</h2>
          <div className="form-col">
            <label>Meal ID: </label>
            <input
              type="text"
              placeholder="Meal ID"
              value={delmeal}
              onChange={(e) => setDeleteMeal(e.target.value)}
            />
            <button onClick={deleteMeal}>Submit</button>
            <p>{message}</p>
          </div>
        </div>

        <div className="form-input">
          <h2>Update Meal</h2>
          <div className="form-col">
            <label>Meal ID: </label>
            <input
              type="text"
              placeholder="Meal ID"
              value={up_meal}
              onChange={(e) => setUpdateMeal(e.target.value)}
            />

            <label>User ID: </label>
            <input
              type="text"
              placeholder="User ID"
              value={new_userid}
              onChange={(e) => setNewUser(e.target.value)}
            />

            <label>Calories: </label>
            <input
              type="text"
              placeholder="Calories"
              value={new_calorie}
              onChange={(e) => setNewCalorie(e.target.value)}
            />

            <label>Protein: </label>
            <input
              type="text"
              placeholder="Protein"
              value={new_protein}
              onChange={(newVal) => setNewProtein(newVal.target.value)}
            />

            <label>Carbs: </label>
            <input
              type="text"
              placeholder="Carbs"
              value={new_carb}
              onChange={(newVal) => setNewCarb(newVal.target.value)}
            />

            <label>Fat: </label>
            <input
              type="text"
              placeholder="Fat"
              value={new_fat}
              onChange={(newVal) => setNewFat(newVal.target.value)}
            />

            <button onClick={updateMeal}>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// function DropDown() {
//   const []
//   return (False);
// }

export default App;
