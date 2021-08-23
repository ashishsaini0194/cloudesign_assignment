import './App.css';
import InfoCont from './components/InfoCont';
import { useState } from "react"

function App() {

  var [inserted_Data, cid] = useState(false)


  var submitData = (e) => {
    e.preventDefault()

    // file handling data
    // data validation can be performed on files but i haven't wrote code for that
    const formData = new FormData();
    var file = document.getElementById("file").files;
    console.log(file[0]);
    formData.append("myfile", file[0])
    console.log(formData);

    // rest of the data
    var date = new Date()
    var timestamp = date.getTime()
    var wholedata = {
      Title: document.getElementById("title").value,
      Description: document.getElementById("description").value,
      Status: document.getElementById("status").value,
      Datetime: timestamp,
    }


    // fetch method to savefiledata in database
    fetch("/savedatafile", {
      method: "POST",
      body: formData,
    })
      .then((r) => r.text().then((d) => {
        if (d == 1) {
          // fetch method to saverestdata in database
          fetch("/savedata", {
            method: "POST",
            body: JSON.stringify(wholedata),
            headers: {
              "Content-Type": "application/json"
            }
          })
            .then((r) => {
              r.json().then((d) => {
                document.getElementById("head1").innerHTML = "data saved";
                cid(d)
              })
            })
            .catch((e) => document.getElementById("head1").innerHTML = e)
        } else {
          document.getElementById("head1").innerHTML = "please mention file"
        }
      }))
      .catch((e) => document.getElementById("head1").innerHTML = "some error occured")
  }

  return (
    <div className="App">
      <div>
        <h2 id="head1">Try Adding some Data.</h2>
        <form onSubmit={(e) => submitData(e)} >
          <label>Title </label> <input required id="title" type="text"></input><br></br>
          <label>Description  </label> <input required id="description" type="text"></input><br></br>
          <label>Status  </label>
          <select id="status">
            <option value="Open">Open</option>
            <option value="InProgress">InProgress</option>
            <option value="Completed">Completed</option>
          </select><br></br>
          <input type="file" id="file" accept="image/jpeg,image/png,application/pdf"></input><br></br>
          <p>"Time stamp is included"</p><br></br>
          <input className="uninp" type="submit"></input>
        </form>
      </div>
      <InfoCont data={inserted_Data} />
    </div>

  );
}

export default App;
