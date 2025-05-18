using System.ComponentModel.DataAnnotations.Schema;

namespace user_group_app.Models
{
    public class Debt
    {
        public int Id { get; set; }
        public int UserOwedToId { get; set; }
        public int UserOwesId { get; set; }
        public decimal Amount { get; set; }

        [ForeignKey("UserOwedToId")]
        public User UserOwedTo { get; set; }

        [ForeignKey("UserOwesId")]
        public User UserOwes { get; set; }

        public int GroupID { get; set; } //fk to group
    }
}
