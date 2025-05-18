using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using user_group_app.Data;
using user_group_app.Models;
using user_group_app.Models.Dto;

namespace user_group_app.Controllers
{
    [Route("api/[Controller]")]
    [ApiController]
    public class TransactionController : Controller
    {
        private readonly ProjectDBContext _DBcontext;

        public TransactionController(ProjectDBContext context)
        {
            _DBcontext = context;
        }

        //Creates a transaction based on the split type specified, updates user debt tables
        [HttpPost]
        public IActionResult Create([FromBody] TransactionDTO transactionDTO)
        {
            if (transactionDTO == null || transactionDTO.TransactionSplits == null)
                return BadRequest();

            decimal splitSum = 0;
            if (transactionDTO.SplitType == "Percentage")
            {
                splitSum = transactionDTO.TransactionSplits.Sum(t => t.Amount);
                if (splitSum != 100)
                    return BadRequest("Percentages must add up to 100");
            }
            else if(transactionDTO.SplitType == "Dynamic")
            {
                splitSum = transactionDTO.TransactionSplits.Sum(t => t.Amount);
                if (splitSum != transactionDTO.Amount)
                    return BadRequest("Splits must add up to the amount paid");
            }

            Transaction transaction = new Transaction
            {
                Name = transactionDTO.Name,
                UserId = transactionDTO.UserId,
                Amount = transactionDTO.Amount,
                GroupID = transactionDTO.GroupID
            };

            transaction.TransactionSplits = GenerateTransactionSplits(transactionDTO);
            if (transactionDTO.TransactionSplits == null)
                return BadRequest();

            bool success = UpdateDebtTables(transaction.TransactionSplits, transactionDTO);
            if(!success)
                return UnprocessableEntity();


            _DBcontext.Transactions.Add(transaction);
            _DBcontext.SaveChanges();

            return Ok();
        }

        //generates splits based on the split type defined in the given transactionDTO
        private List<TransactionSplit>? GenerateTransactionSplits(TransactionDTO transactionDTO)
        {
            List<TransactionSplit> transactionSplits = new List<TransactionSplit>();

            if (transactionDTO.SplitType.Equals("Equal"))
            {
                int groupID = transactionDTO.GroupID;
                Group? group = _DBcontext.Groups.Include(g => g.Users).FirstOrDefault(g => g.Id == groupID);

                if (group == null)
                    return null;

                List<User> groupMembers = group.Users;

                foreach (User member in groupMembers)
                {
                    TransactionSplit newSplit = new TransactionSplit
                    {
                        Amount = Math.Round(transactionDTO.Amount / groupMembers.Count(), 2),
                        UserId = member.Id
                    };
                    transactionSplits.Add(newSplit);
                }
            }

            if (transactionDTO.TransactionSplits == null)
                return null;

            else if (transactionDTO.SplitType.Equals("Percentage"))
            {
                foreach (TransactionSplit split in transactionDTO.TransactionSplits)
                {
                    TransactionSplit newSplit = new TransactionSplit
                    {
                        Amount = Math.Round(split.Amount / 100 * transactionDTO.Amount, 2),
                        UserId = split.UserId
                    };
                    transactionSplits.Add(newSplit);
                }
            }

            else if (transactionDTO.SplitType.Equals("Dynamic"))
            {
                transactionSplits = transactionDTO.TransactionSplits;
            }

            return transactionSplits;
        }
        private bool UpdateDebtTables(List<TransactionSplit> splits, TransactionDTO transactionDTO)
        {
            foreach (TransactionSplit split in splits)
            {
                int memberID = split.UserId; //group member who owes to payer
                int payerID = transactionDTO.UserId; //payer
                int groupID = transactionDTO.GroupID;

                if (payerID != memberID)
                {
                    //how much the group member owes the payer
                    Debt? debtOfMemberToPayer = _DBcontext.Debts.FirstOrDefault(d => d.UserOwedToId == payerID && d.UserOwesId == memberID && d.GroupID == groupID);
                    //how much the payer owes the group member
                    Debt? debtOfPayerToMember = _DBcontext.Debts.FirstOrDefault(d => d.UserOwedToId == memberID && d.UserOwesId == payerID && d.GroupID == groupID);

                    if (debtOfMemberToPayer == null || debtOfPayerToMember == null)
                    {
                        return false;
                    }

                    if (debtOfPayerToMember.Amount == 0)
                    {
                        debtOfMemberToPayer.Amount += split.Amount;
                    }
                    else if (debtOfPayerToMember.Amount < split.Amount)
                    {
                        debtOfMemberToPayer.Amount = split.Amount - debtOfPayerToMember.Amount;
                        debtOfPayerToMember.Amount = 0;
                    }
                    else if (debtOfPayerToMember.Amount == split.Amount)
                    {
                        debtOfPayerToMember.Amount = 0;
                    }
                    else if (debtOfPayerToMember.Amount > split.Amount)
                    {
                        debtOfPayerToMember.Amount -= split.Amount;
                    }
                }
            }
            return true;
        }
    }
}
