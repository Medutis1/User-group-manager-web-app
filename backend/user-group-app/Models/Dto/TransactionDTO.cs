namespace user_group_app.Models.Dto
{
    public class TransactionDTO
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public int UserId { get; set; } //who paid
        public decimal Amount { get; set; }
        public int GroupID { get; set; }
        public required string SplitType { get; set; }
        public List<TransactionSplit>? TransactionSplits { get; set; } = new List<TransactionSplit>();
    }
}
