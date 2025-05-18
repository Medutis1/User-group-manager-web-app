namespace user_group_app.Models.Dto
{
    public class AllGroupsDTO
    {
        public int GroupId { get; set; }
        public required string GroupName { get; set; }
        public decimal UserDebt {  get; set; }
        public decimal OwedToUser { get; set; }
    }
}
