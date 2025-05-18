using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace user_group_app.Models
{
    public class User
    {
        public int Id { get; set; }
        public required string Name { get; set; }

        [JsonIgnore]
        public List<Group> Groups { get; set; } = new List<Group>();
    }
}
