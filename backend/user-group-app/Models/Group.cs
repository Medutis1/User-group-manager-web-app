using System.ComponentModel.DataAnnotations;

namespace user_group_app.Models
{
    public class Group
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public List<User> Users { get; set; } = new List<User>();
        public List<Transaction> Transactions { get; set; } = new List<Transaction>();
        public List<Debt> Debts { get; set; } = new List<Debt>();
    }
}
