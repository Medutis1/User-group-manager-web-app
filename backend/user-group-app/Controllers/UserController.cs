using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using user_group_app.Data;
using user_group_app.Models;
using user_group_app.Models.Dto;

namespace user_group_app.Controllers
{
    [Route("api/[Controller]")]
    [ApiController]
    public class UserController : Controller
    {
        private readonly ProjectDBContext _DBcontext;
        public UserController(ProjectDBContext context)
        {
            _DBcontext = context;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            List<User> users = _DBcontext.Users.ToList();
            return Ok(users);
        }

        [HttpGet("isloggedin")]
        public IActionResult IsLoggedIn()
        {
            int? userId = HttpContext.Session.GetInt32("userId");

            if (userId == null)
            {
                return Ok(false);
            }
            else
            {
                return Ok(true);
            }
        }

        [HttpPost]
        public IActionResult Create([FromBody] User user)
        {
            if (user == null)
                return BadRequest();

            _DBcontext.Users.Add(user);
            _DBcontext.SaveChanges();

            return Ok();
        }

        [HttpPost("login/{id:int}")]
        public IActionResult Login([FromRoute]int id)
        {
            HttpContext.Session.SetInt32("userId", id);
            return Ok();
        }
    }
}
