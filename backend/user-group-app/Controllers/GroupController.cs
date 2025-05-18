using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using user_group_app.Data;
using user_group_app.Models;
using user_group_app.Models.Dto;

namespace user_group_app.Controllers
{
    [Route("api/[Controller]")]
    [ApiController]
    public class GroupController : Controller
    {
        private readonly ProjectDBContext _DBcontext;

        public GroupController(ProjectDBContext context)
        {
            _DBcontext = context;
        }

        //Endpoint to get data of a specific group
        [HttpGet("{id:int}")]
        public IActionResult Get(int id)
        {
            if (id == 0)
                return BadRequest();

            Group? group = _DBcontext.Groups.Include(g => g.Users)
                                           .Include(g => g.Transactions)
                                             .ThenInclude(t => t.TransactionSplits)
                                             .ThenInclude(ts => ts.User)
                                           .Include(g => g.Transactions)
                                             .ThenInclude(t => t.User)
                                           .FirstOrDefault(g => g.Id == id);

            if (group == null)
                return NotFound();

            return Ok(group);
        }

        //Endpoint for all groups page
        [HttpGet]
        public IActionResult GetAllGroupsAndDebtData()
        {
            List<Group> allGroups = _DBcontext.Groups.ToList();
            List<AllGroupsDTO> allGroupsDTO = new List<AllGroupsDTO>();

            int? userId = HttpContext.Session.GetInt32("userId");
            if (userId == null)
                return BadRequest();

            foreach (Group group in allGroups)
            {
                List<Debt> owedToUser = _DBcontext.Debts.Where(d => d.UserOwedToId == userId && d.GroupID == group.Id).ToList();
                List<Debt> userDebts = _DBcontext.Debts.Where(d => d.UserOwesId == userId && d.GroupID == group.Id).ToList();

                AllGroupsDTO debtDTO = new AllGroupsDTO
                {
                    GroupId = group.Id,
                    GroupName = group.Title,
                    OwedToUser = 0,
                    UserDebt = 0
                };

                foreach (Debt debt in owedToUser )
                {
                    debtDTO.OwedToUser += debt.Amount;
                }

                foreach (Debt debt in userDebts)
                {
                    debtDTO.UserDebt += debt.Amount;
                }

                allGroupsDTO.Add(debtDTO);
            }

            return Ok(allGroupsDTO);
        }

        //Endpoint to get data of who owes how much and to who in a specific group
        [HttpGet("summary/{groupId:int}")]
        public IActionResult GetGroupSummary([FromRoute] int groupId)
        {
            int? userId = HttpContext.Session.GetInt32("userId");
            if (userId == null)
                return BadRequest();

            Group? group = _DBcontext.Groups.Include(g => g.Users)
                                           .FirstOrDefault(g => g.Id == groupId);

            if(group == null)
                return BadRequest();

            List<Debt> debtsToUser = _DBcontext.Debts.Include(d => d.UserOwes)
                                                     .Include(d => d.UserOwedTo)
                                                     .Where(d => d.UserOwedToId == userId && d.GroupID == groupId)
                                                     .ToList();

            List<Debt> userDebts = _DBcontext.Debts.Include(d => d.UserOwes)
                                                    .Include(d => d.UserOwedTo)
                                                    .Where(d => d.UserOwesId == userId && d.GroupID == groupId)
                                                    .ToList();

            List<GroupDebtSummaryDTO> debtSummaries = new List<GroupDebtSummaryDTO>();

            foreach (User user in group.Users)
            {
                GroupDebtSummaryDTO debtSummary = new GroupDebtSummaryDTO
                {
                    Username = user.Name,
                    UserId = user.Id,
                    OwesUser = 0,
                    UserOwesOther = 0
                };

                debtSummaries.Add(debtSummary);
            }

            //goes through the debtSummary list where all group user names are set, sets how much they owe the user
            foreach (GroupDebtSummaryDTO debtSummary in debtSummaries)
            {
                Debt? matchingDebt = debtsToUser.FirstOrDefault(d => d.UserOwesId == debtSummary.UserId);
                if (matchingDebt != null)
                {
                    debtSummary.OwesUser = matchingDebt.Amount;
                }
            }

            //set what the logged in user owes to other users
            foreach (GroupDebtSummaryDTO debtSummary in debtSummaries)
            {
                Debt? matchingDebt = userDebts.FirstOrDefault(d => d.UserOwedToId == debtSummary.UserId);
                if (matchingDebt != null)
                {
                    debtSummary.UserOwesOther = matchingDebt.Amount;
                }
            }

            return Ok(debtSummaries);
        }

        [HttpPost]
        public IActionResult Create([FromBody] Group group)
        {
            if (group == null)
                return BadRequest();

            _DBcontext.Groups.Add(group);
            _DBcontext.SaveChanges();

            return Ok();
        }

        //Endpoint to add a user to a group
        [HttpPost("adduser")]
        public IActionResult addUser([FromBody] AddUserToGroupDTO userToAddToGroupDTO)
        {
            if (userToAddToGroupDTO == null)
                return BadRequest();

            User? userToAddToGroup = _DBcontext.Users.FirstOrDefault(u => u.Id == userToAddToGroupDTO.UserId);

            //create debt tables
            Group? group = _DBcontext.Groups.Include(g => g.Users).FirstOrDefault(g => g.Id == userToAddToGroupDTO.GroupId);

            if (userToAddToGroup == null || group == null)
                return BadRequest();

            //check if user already exists in group
            User? userInGroup = group.Users.FirstOrDefault(u => u.Id == userToAddToGroup.Id);
            if (userInGroup != null)
            {
                return Ok();
            }

            foreach (User groupMember in group.Users)
            {
                Debt debt = new Debt { 
                    UserOwedToId = groupMember.Id,
                    UserOwesId = userToAddToGroup.Id, 
                    Amount = 0, GroupID = userToAddToGroupDTO.GroupId };

                Debt debtReverse = new Debt { 
                    UserOwedToId = userToAddToGroup.Id,
                    UserOwesId = groupMember.Id,
                    Amount = 0,
                    GroupID = userToAddToGroupDTO.GroupId };

                _DBcontext.Debts.Add(debt);
                _DBcontext.Debts.Add(debtReverse);
            }

            userToAddToGroup.Groups.Add(group);

            _DBcontext.SaveChanges();
            return Ok();
        }

        [HttpPost("removeuser")]
        public IActionResult RemoveUser([FromBody] RemoveUserFromGroupDTO removeDTO)
        {
            if (removeDTO == null)
                return BadRequest();

            //validation if user is settled with everyone in the group
            List<Debt> userDebts = _DBcontext.Debts.Where(d => d.GroupID == removeDTO.GroupId &&
                                                            d.UserOwesId == removeDTO.UserId &&
                                                            d.Amount > 0).ToList();

            List<Debt> owedToUser = _DBcontext.Debts.Where(d => d.GroupID == removeDTO.GroupId &&
                                                            d.UserOwedToId == removeDTO.UserId &&
                                                            d.Amount > 0).ToList();

            if (userDebts.Count() > 0 || owedToUser.Count() > 0)
            {
                return BadRequest("User is not settled with everyone in the group");
            }
            else
            {
                Group? group = _DBcontext.Groups.Include(g => g.Users).FirstOrDefault(g => g.Id == removeDTO.GroupId);
                if (group == null)
                    return BadRequest();

                User? userToRemove = group.Users.FirstOrDefault( u => u.Id == removeDTO.UserId);
                if (userToRemove == null)
                    return BadRequest();

                List<Debt> allDebtsToDelete = _DBcontext.Debts.Where(d => d.GroupID == removeDTO.GroupId &&
                                                                     (d.UserOwesId == removeDTO.UserId ||
                                                                     d.UserOwedToId == removeDTO.UserId)).ToList();

                _DBcontext.Debts.RemoveRange(allDebtsToDelete);

                group.Users.Remove(userToRemove);

                _DBcontext.SaveChanges();
            }

            return Ok();
        }

    }
}
