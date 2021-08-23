import React, { useEffect, useState, useRef } from 'react'
import './infoCont.css'

function InfoCont(props) {
    var [wholedata, chngwd] = useState({ "Open": [], "InProgress": [], "Completed": [] })
    var ref1 = useRef(null)

    // this block of code will work as component will mount
    useEffect(() => {
        fetch("/getData")
            .then((r) => r.json().then((d) => {
                chngwd({ "Open": d.Open, "InProgress": d.InProgress, "Completed": d.Completed })
            }))
            .catch((e) => console.log(e))
    }, [])

    // this block will run only when props changes
    if (ref1.current == null) {
        ref1.current = props.data._id;
    } else {
        if (props.data_id !== ref1.current) {
            ref1.current = props.data_id
            switch (props.data.Status) {
                case "Open":
                    chngwd({ "Open": [...wholedata.Open, props.data], "InProgress": wholedata.InProgress, "Completed": wholedata.Completed })
                    break
                case "InProgress":
                    chngwd({ "Open": wholedata.Open, "InProgress": [...wholedata.InProgress, props.data], "Completed": wholedata.Completed })
                    break
                case "Completed":
                    chngwd({ "Open": wholedata.Open, "InProgress": wholedata.InProgress, "Completed": [...wholedata.Completed, props.data] })
                    break
            }
        }
    }


    var maineditFunc = (e) => { //editing data
        console.log(e.target);
        var val1 = document.getElementById("inp1").value;
        var val2 = document.getElementById("inp2").value;
        console.log(val1.length, val2.length);

        var newdata = wholedata[gsde].map((d) => {
            // console.log(d._id);
            if (d._id == e.target.value) {
                if (val1.length != 0) {
                    d.Title = val1
                } else {
                    val1 = d.Title;
                }
                if (val2.length != 0) {
                    d.Description = val2
                } else {
                    val2 = d.Description;
                }
                return d
            } else {
                return d
            }
        })

        // saving/editing data in data base, then in states
        fetch("/editData", {
            method: "POST",
            body: JSON.stringify({ "_id": e.target.value, "Title": val1, "Description": val2 }),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then((r) => r.text().then((d) => {
                if (d == 1) {
                    document.getElementById("oldh4").style.display = "block"
                    document.getElementById("newDIv").style.display = "none"
                    switch (gsde) {
                        case "Open":
                            chngwd({ "Open": newdata, "InProgress": wholedata.InProgress, "Completed": wholedata.Completed })
                            break
                        case "InProgress":
                            chngwd({ "Open": wholedata.Open, "InProgress": newdata, "Completed": wholedata.Completed })
                            break
                        case "Completed":
                            chngwd({ "Open": wholedata.Open, "InProgress": wholedata.InProgress, "Completed": newdata })
                            break
                    }
                } else {
                    alert("error occured")
                }

            }))
            .catch((e) => { console.log(e) })
    }

    var gsde; //current state

    // when drag started
    var startdragging = (e) => {
        gsde = e.target.parentElement.id;
        e.dataTransfer.setData("data", e.target.id)
    }

    // it runs when draggle item is above the different target element
    var overDragging = (e) => {
        e.preventDefault()
    }

    // after dropping
    var dropped = (e) => {
        console.log(wholedata);
        var dropParid = e.target.id //next state
        e.preventDefault()
        var data = e.dataTransfer.getData("data");
        console.log(data);

        document.getElementById("oldh4").style.display = "block"
        document.getElementById("newDIv").style.display = "none"
        // editing data
        if (dropParid == "EditBox") {
            document.getElementById("oldh4").style.display = "none"
            document.getElementById("newDIv").style.display = "flex"
            document.getElementById("but1").value = data;

        } // deleting data 
        else if (dropParid == "DeleteBox") {
            fetch("/deleteData", {
                method: "POST",
                body: JSON.stringify({ "_id": data }),
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then((r) => r.text().then((d) => {
                    if (d == 1) {
                        // i am not modifying state to prevent re-render as it not necessary 
                        document.getElementById(data).remove()

                    } else {
                        alert("error occured")
                    }

                }))
                .catch((e) => { console.log(e) })
        } else { // changing task status
            if (gsde != dropParid) {
                fetch("/editstate", {
                    method: "POST",
                    body: JSON.stringify({ "_id": data, "Status": dropParid }),
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                    .then((r) => r.text().then((d) => {
                        console.log(d)
                        if (d == 1) {
                            // i am not modifying state to prevent re-render as it not necessary
                            document.getElementById(dropParid).appendChild(document.getElementById(data))
                        }

                    }))
                    .catch((e) => console.log(e))
            }
        }
    }

    return (

        <div id="maintable">
            <div onDrop={dropped} onDragOver={overDragging} id="Open" className="childtab">
                <h3>Open</h3>
                {wholedata.Open.map((d) => {
                    return <p draggable="true" onDragStart={startdragging} id={d._id} key={d._id} >{d.Title}</p>
                })}
            </div>
            <div onDrop={dropped} onDragOver={overDragging} id="InProgress" className="childtab">
                <h3>Work in progress</h3>
                {wholedata.InProgress.map((d) => {
                    return <p draggable="true" onDragStart={startdragging} id={d._id} key={d._id} >{d.Title}</p>
                })}
            </div>
            <div onDrop={dropped} onDragOver={overDragging} id="Completed" className="childtab">
                <h3>Completed</h3>
                {wholedata.Completed.map((d) => {
                    return <p draggable="true" onDragStart={startdragging} id={d._id} key={d._id} >{d.Title}</p>
                })}
            </div>
            <div onDrop={dropped} onDragOver={overDragging} id="DeleteBox" className="childtab">
                <h3>DeleteBox</h3>
                <h4>drop here to delete</h4>
            </div>
            <div onDrop={dropped} onDragOver={overDragging} id="EditBox" className="childtab">
                <h3>EditBox</h3>
                <h4 id="oldh4">drop here to Edit</h4>
                <div id="newDIv">
                    {/* Title: "4", Description: "adfs", Status: "Completed" */}
                    <label>Title : </label><input id="inp1" type="text"></input>
                    <label>Description : </label><input id="inp2" type="text"></input>
                    <button id="but1" value="" onClick={maineditFunc}>OK</button>
                </div>
            </div>
        </div>
    )
}

export default InfoCont
