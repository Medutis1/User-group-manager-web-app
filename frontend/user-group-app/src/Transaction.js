import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from './Navigationbar.js';

function Transaction() {
    const params = useParams();
    const [groupTitle, setGroupTitle] = useState('');
    const [members, setMembers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [transactionName, setTransactionName] = useState('');
    const [amount, setAmount] = useState('');
    const [splitType, setSplitType] = useState("Equal");
    const [inputDisabled, setInputDisabled] = useState(true);
    const [splits, setSplits] = useState([{userId:null, amount: 0}]);
    const [validationError, setValidationError] = useState('');
    const [amountLabel, setAmountLabel] = useState("Amount");

    const navigate = useNavigate()
    
    async function getData(){
        try{
            const responseGroup = await fetch(`http://localhost:5071/api/group/${params.id}`)
            if(!responseGroup.ok){
                console.log("Fetch error:", responseGroup)
                navigate("/")
            }
            const jsonDataGroup = await responseGroup.json()
            setGroupTitle(jsonDataGroup.title)
            setMembers(jsonDataGroup.users)

            //by default auto select first in group as the person who pays
            setSelectedUser(jsonDataGroup.users[0].id)

            //set user ids
            const newSplits = jsonDataGroup.users.map((member) => {return {userId: member.id,amount: 0}})
            setSplits(newSplits)
            // console.log("newSplits:" + splits)
        }
        catch(error){
            console.error(error)
        }
    }

    async function sendData() {
        //e.preventDefault()
        try{
            const response = await fetch("http://localhost:5071/api/transaction", {
                method: 'POST',
                headers:{
                    'Content-Type':'application/json',
                },
                body: JSON.stringify({
                    Name: transactionName,
                    UserId: selectedUser,
                    Amount: amount,
                    GroupId: params.id,
                    SplitType: splitType,
                    TransactionSplits: splits
                })
            })
            if(!response.ok){
                console.log("Fetch error:", response)
                const errorText = await response.text()
                setValidationError(errorText)
                console.log(errorText)
                return false
            }

            return true
        }
        catch(error){
            console.error(error)
            return false
        }
    }

    
    function handleSelect(e){
        setSplitType(e.target.value)
        if (e.target.value == "Equal"){
            setAmountLabel("Amount")
            setInputDisabled(true)
        } 
        else if(e.target.value == "Percentage"){
            setAmountLabel("Percent")
            setInputDisabled(false)
        }
        else{
            setAmountLabel("Amount")
            setInputDisabled(false)
        }
    }

    function handleSplitChange(e, index){
        let updatedSplits = [...splits] //takes current values in this state and spreads
        //console.log(updatedSplits)
        updatedSplits[index].amount = e.target.value
        setSplits(updatedSplits)
    }

    async function handleClick(e){
        e.preventDefault()
        const success = await sendData()
        if(success){
            navigate(-1)
        }
    }
    
    useEffect(() => {
        getData()
    }, []);
    

    return (
        <div>
            <NavBar/>
            <div className="container">
                <h3 className="text-center">Create a new transaction for group: {groupTitle}</h3>
                <div className="row justify-content-center">
                    <form className="col-md-4" onSubmit={handleClick}>
                        <label htmlFor="Name" className="form-label">Transaction name</label>
                        <input type="text" className="form-control" id="Name" name="Name" required onChange={(e) => {setTransactionName(e.target.value)}}/>

                        <label htmlFor="Payer" className="form-label">Who is paying</label>
                        <select id="Payer" className="form-select" onChange={(e) => {setSelectedUser(e.target.value)}}>
                            {
                                members.map(member => (
                                    <option value={member.id}>{member.name}</option>
                                ))
                            }
                        </select>

                        <label htmlFor="Amount" className="form-label">Amount paid</label>
                        <input type="number" className="form-control" id="Amount"
                                 name="Amount" min="0" step="0.01" required onChange={(e) => {setAmount(e.target.value)}}/>

                        <label htmlFor="SplitType" className="form-label">How is the amount going to be split</label>
                        <select id="SplitType" className="form-select" onChange={(e) => {handleSelect(e)}}>
                            <option value="Equal">Equal</option>
                            <option value="Percentage">Percentage</option>
                            <option value="Dynamic">Dynamic</option>
                        </select>

                            {members.map((member, index) => {
                                return <div>
                                    <label htmlFor={member.id} className="form-label">{amountLabel} for {member.name}</label>
                                    <input type="number" className="form-control" id={member.id}
                                         name="a" disabled={inputDisabled} required placeholder="0" min="0" step="0.01"
                                          onChange={(e) => {handleSplitChange(e, index)}}/>
                                </div>
                            })}
                        
                        <p className="text-danger">{validationError}</p>
                        <div className="d-flex justify-content-center">
                            <button type="button" className="btn btn-primary m-2" onClick={() => {navigate(-1)}}>Back</button>
                            <button type="submit" className="btn btn-primary m-2">Create transaction</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Transaction;
