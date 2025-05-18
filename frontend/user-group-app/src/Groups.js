import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import NavBar from './Navigationbar.js';

function Groups() {
const [groupTitle, setGroupTitle] = useState('');
const [groups, setGroups] = useState([]);

    const navigate = useNavigate();

    async function getData(){
        try{
            const response = await fetch("http://localhost:5071/api/group", {
                method:"GET",
                credentials: 'include'
            })
            if(!response.ok){
                console.log("Fetch error:", response)
            }
            const jsonData = await response.json()
            // console.log(jsonData)
            setGroups(jsonData)
        }
        catch(error){
            console.error(error)
        }
    }

    async function sendGroups(e){
        try{
            const response = await fetch("http://localhost:5071/api/group", {
                method: 'POST',
                headers:{
                    'Content-Type':'application/json',
                },
                body: JSON.stringify({
                    Title: groupTitle
                })
            })
            if(!response.ok){
                console.log("Fetch error:", response)
            }
        }
        catch(error){
            console.error(error)
        }
    }

    async function handleClick(e){
        e.preventDefault()
        setGroupTitle('')
        await sendGroups() 
        await getData()
    }


    useEffect(() => {
        getData()
    }, []);


    return (
        <div>
            <NavBar/>
            <div className="container">
                <h1 className="text-center mb-5">All groups</h1>
                {
                groups.length > 0 && (
                    <table className="table">
                    <thead>
                        <tr>
                            <th>Group name</th>
                            <th>Total amount owed to you</th>
                            <th>Your total debt</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        groups.map((group) => {
                            return <tr key={group.groupId}>
                                <td>{group.groupName}</td>
                                <td>{group.owedToUser}</td>
                                <td>{group.userDebt}</td>
                                <td><button className="btn btn-primary" onClick={() => {navigate(`/group/${group.groupId}`)}}>Details</button></td>
                            </tr>
                            })     
                    }
                    </tbody>
                </table>
                )}
                <div className="row justify-content-center">
                    <form className="col-md-4" onSubmit={(handleClick)}>
                        <label htmlFor="Title" className="form-label">Create a new group:</label>
                        <input type="text" className="form-control" id="Title" name="Title" value={groupTitle} required onChange={(e) => {setGroupTitle(e.target.value)}}/>
                        <button type="submit" className="btn btn-primary mt-2">Create</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Groups;
