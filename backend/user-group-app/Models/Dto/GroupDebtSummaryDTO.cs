namespace user_group_app.Models.Dto
{
    public class GroupDebtSummaryDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public required string Username { get; set; }
        public decimal OwesUser {  get; set; }
        public decimal UserOwesOther { get; set; }

    }
}
