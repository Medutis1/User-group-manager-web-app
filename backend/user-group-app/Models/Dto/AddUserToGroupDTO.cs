namespace user_group_app.Models.Dto
{
    public class AddUserToGroupDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int GroupId {  get; set; }
    }
}
