import { useState, useEffect } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import NavBar from './Navigationbar.js';

function AddUser() {
    const [name, setName] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const navigate = useNavigate()

    async function getData(){
        try{
            const responseUser = await fetch(`http://localhost:5071/api/user`)
            if(!responseUser.ok){
                console.log("Fetch error:", responseUser)
            }
            const jsonDataUser = await responseUser.json()
            setUsers(jsonDataUser)
            //console.log(jsonDataUser)
            if(jsonDataUser.length > 0){
                setSelectedUser(jsonDataUser[0].id)
            }   
        }
        catch(error){
            console.error(error)
        }
    }

    async function createUser(){
        try{
            const response = await fetch("http://localhost:5071/api/user", {
                method: 'POST',
                headers:{
                    'Content-Type':'application/json',
                },
                body: JSON.stringify({
                    Name: name
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

    async function login(){
        try{
            const response = await fetch(`http://localhost:5071/api/user/login/${selectedUser}`, {
                method: 'POST',
                credentials: 'include'
            })
            if(!response.ok){
                console.log("Fetch error:", response)
            }
            const user = users.find((user) => {return user.id == selectedUser})
            if(user != undefined){
                sessionStorage.setItem('username', user.name)
            }
        }
        catch(error){
            console.error(error)
        }
    }

    async function setLoggedIn(){
         try{
            const response = await fetch("http://localhost:5071/api/user/isloggedin", {
                method: 'GET',
                credentials: 'include'
            })
            if(!response.ok){
                console.log("Fetch error:", response)
            }
            const result = await response.json()
            setIsLoggedIn(result)
        }
        catch(error){
            console.error(error)
        }
    }

    async function handleLoginClick(e){
        e.preventDefault();
        await login()
        navigate("/groups")
    }

    async function handleAddClick(e){
        e.preventDefault();
        setName('')
        await createUser()
        await getData()
    }

    useEffect(() => {
        getData()
        setLoggedIn()
    }, []);

    return (
        <div>
            {isLoggedIn && <NavBar/>}
            <div className="container">
                <h2 className="text-center">Create user / select which one to log in as</h2>
                <div className="row justify-content-center p-5">
                    <form className="col-md-4" onSubmit={handleAddClick}>
                        <h4>Create new user</h4>
                        <label htmlFor="Name" className="form-label">Username:</label>
                        <input type="text" className="form-control" id="Name" name="Name" value={name} required onChange={(e) => {setName(e.target.value)}}/>
                        <button className="btn btn-primary mt-2" type="submit">Create</button>
                    </form>
                </div>

                <div className="row justify-content-center p-5">
                    <form className="col-md-4" onSubmit={(handleLoginClick)}>
                        <h4>Select user to log in as</h4>
                        <label htmlFor="Payer" className="form-label">User select</label>
                        <select id="Payer" className="form-select" onChange={(e) => {setSelectedUser(e.target.value)}}>
                            {
                                users.map(user => {
                                    return <option value={user.id} key={user.id} >{user.name}</option>
                                })
                            }
                        </select>
                        <button className="btn btn-primary mt-2" type="submit">Login as selected</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddUser;
