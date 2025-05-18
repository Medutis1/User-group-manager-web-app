import { Fragment, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from './Navigationbar.js';

function Group() {
    const params = useParams();
    const [groupTitle, setGroupTitle] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [debts,setDebts] = useState([]);
    const [validationError, setValidationError] = useState('');

    const navigate = useNavigate()

    async function getData(){
        try{
            //get group transaction data
            const responseGroup = await fetch(`http://localhost:5071/api/group/${params.id}`)
            if(!responseGroup.ok){
                console.log("Fetch error:", responseGroup)
                navigate("/")
            }
            const jsonDataGroup = await responseGroup.json()
            setGroupTitle(jsonDataGroup.title)
            setTransactions(jsonDataGroup.transactions)

            //get system users data
            const responseUser = await fetch(`http://localhost:5071/api/user`)
            if(!responseUser.ok){
                console.log("Fetch error:", responseUser)
            }
            const jsonDataUser = await responseUser.json()
            //console.log(jsonDataUser)
            setUsers(jsonDataUser)

            if(jsonDataUser.length > 0){
                setSelectedUser(jsonDataUser[0].id)
            }   

            //get group debt data
            const responseDebt = await fetch(`http://localhost:5071/api/group/summary/${params.id}`, {
                method: "GET",
                credentials: "include"
            })
            if(!responseDebt.ok){
                console.log("Fetch error:", responseDebt)
                const errorText = await responseDebt.text()
                console.log(errorText)
            }
            const jsonDebtData = await responseDebt.json()
            console.log(jsonDebtData)
            setDebts(jsonDebtData)

        
        }
        catch(error){
            console.error(error)
        }
    }

    async function sendMemberData() {
        //e.preventDefault()
        try{
            const response = await fetch("http://localhost:5071/api/group/adduser", {
                method: 'POST',
                headers:{
                    'Content-Type':'application/json',
                },
                body: JSON.stringify({
                    UserId: selectedUser,
                    GroupId: params.id
                })
            })
            if(!response.ok){
                console.log("Fetch error:", response)
                const errorText = await response.text()
                console.log(errorText)
            }
        }
        catch(error){
            console.error(error)
        }
    }

    async function sendSettleData(userId){
         try{

            const response = await fetch("http://localhost:5071/api/debt/settle", {
                method: 'POST',
                credentials: 'include',
                headers:{
                    'Content-Type':'application/json',
                },
                body: JSON.stringify({
                    UserOwedToId: userId,
                    GroupId: params.id
                })
            })
            if(!response.ok){
                console.log("Fetch error:", response)
                const errorText = await response.text()
                console.log(errorText)
            }
        }
        catch(error){
            console.error(error)
        }
    }

    async function sendRemoveUserData(userId){
         try{
            const response = await fetch("http://localhost:5071/api/group/removeuser", {
                method: 'POST',
                headers:{
                    'Content-Type':'application/json',
                },
                body: JSON.stringify({
                    UserId: userId,
                    GroupId: params.id
                })
            })
            if(!response.ok){
                console.log("Fetch error:", response)
                const errorText = await response.text()
                console.log(errorText)
                setValidationError(errorText)
            }
            else{
                setValidationError('')
            }
        }
        catch(error){
            console.error(error)
        }
    }

    async function handleAddMemberClick(e){
        e.preventDefault();
        await sendMemberData();
        await getData()
    }

    async function handleSettleClick(userId){
        await sendSettleData(userId)
        await getData()
    }

    async function handleRemoveClick(userId){
        await sendRemoveUserData(userId)
        await getData()
    }

    function SettleButton({userOwesOther, userId}){
        if(userOwesOther > 0){
            return <button className="btn btn-success ms-1" onClick={()=>{handleSettleClick(userId)}}>Settle</button>
        }
        else{
            return;
        }
    }


    useEffect(() => {
        getData()
    }, []);

    return (
        <div>
            <NavBar/>
            <div className="container">
                <h1 className="text-center">Group {groupTitle} Details</h1>
                <div className="row justify-content-center mt-5">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Group member</th>
                                <th>Owes you</th>
                                <th>You owe</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                        {
                            debts.map(debt => (
                            <tr>
                                <td>{debt.username}</td>
                                <td>{debt.owesUser}</td>
                                <td>{debt.userOwesOther}</td>
                                <td>
                                    <button className="btn btn-danger" onClick={()=>{handleRemoveClick(debt.userId)}}>Remove user</button>
                                    <SettleButton userOwesOther={debt.userOwesOther} userId={debt.userId}/>
                                </td>
                            </tr> ))     
                        }
                        </tbody>
                    </table>

                    <p className="text-danger">{validationError}</p>
                    <form className="col-md-4" onSubmit={handleAddMemberClick}>
                        <select value={selectedUser} className="form-select" onChange={(e) => {setSelectedUser(e.target.value)}}>
                        {
                            users.map(user => (
                                <option value={user.id}>{user.name}</option>
                            ))
                        }
                        </select>
                        <div className="d-flex justify-content-center">
                            <button type="submit" className='btn btn-primary mt-2'>Add a new member</button>
                        </div>
                    </form>
                </div>

                <div className="row justify-content-center mt-5">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Transaction name</th>
                                <th>Who paid</th>
                                <th>Amount paid</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                        {
                            transactions.map(transaction => (
                                <Fragment key={transaction.id}>
                                    <tr>
                                        <td>{transaction.name}</td>
                                        <td>{transaction.user.name}</td>
                                        <td>{transaction.amount}</td>
                                        <td>
                                            <button className="btn btn-primary" data-bs-toggle="collapse" data-bs-target={`#collapse-${transaction.id}`}>Show splits</button>
                                        </td>
                                    </tr> 
                                    <tr className="collapse" id={`collapse-${transaction.id}`}>
                                        <td colSpan="3">
                                            <ul className="list-group">
                                                {
                                                    transaction.transactionSplits.map(split => (
                                                        <li key={split.id} className="list-group-item d-flex justify-content-start">
                                                            <span className="me-5">Username: {split.user.name}</span>
                                                            <span>Amount: {split.amount}</span>
                                                        </li>
                                                    ))
                                                }
                                            </ul>
                                        </td>
                                    </tr>                                    
                                </Fragment>
                            ))     
                        }
                        </tbody>
                    </table>
                    <div className="col-md-4 d-flex justify-content-center">
                        <button type="button" className='btn btn-primary mt-2' onClick={() => {navigate(`/transaction/${params.id}`)}}>Create a transaction</button>
                    </div>
                </div>
                
            </div>
        </div>
    );
}

export default Group;
