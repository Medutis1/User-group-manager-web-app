using Microsoft.EntityFrameworkCore;
using user_group_app.Models;

namespace user_group_app.Data
{
    public class ProjectDBContext : DbContext
    {
        public DbSet<Group> Groups { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Debt> Debts { get; set; }
        public ProjectDBContext(DbContextOptions options) : base(options)
        {
        }
    }
}
