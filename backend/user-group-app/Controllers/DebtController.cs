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
    public class DebtController : Controller
    {
        private readonly ProjectDBContext _DBcontext;
        public DebtController(ProjectDBContext context)
        {
            _DBcontext = context;
        }

        //settles the debt between the logged in user and the user specified in debtDTO
        [HttpPost("settle")]
        public IActionResult SettleDebt([FromBody] SettleDebtDTO debtDTO)
        {
            if (debtDTO == null)
                return BadRequest();

            int? userID = HttpContext.Session.GetInt32("userId");

            Debt? debt = _DBcontext.Debts.FirstOrDefault(d => d.GroupID == debtDTO.GroupId &&
                                                        d.UserOwedToId == debtDTO.UserOwedToId &&
                                                        d.UserOwesId == userID);

            if (debt == null)
                return BadRequest();

            debt.Amount = 0;

            _DBcontext.SaveChanges();

            return Ok();
        }

    }
}
