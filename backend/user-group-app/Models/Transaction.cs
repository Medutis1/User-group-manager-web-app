using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace user_group_app.Models
{
    public class Transaction
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public decimal Amount { get; set; }
        public int UserId { get; set; } //id of user who paid
        public User? User { get; set; }
        public int GroupID { get; set; }
        public List<TransactionSplit>? TransactionSplits { get; set; } = new List<TransactionSplit>();
    }
}
