using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace user_group_app.Models
{
    public class TransactionSplit
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public decimal Amount { get; set; }
        public int TransactionId { get; set; }

    }
}
