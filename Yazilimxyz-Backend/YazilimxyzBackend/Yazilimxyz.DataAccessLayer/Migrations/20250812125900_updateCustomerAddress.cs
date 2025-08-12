using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Yazilimxyz.DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class updateCustomerAddress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CustomerAddresses_CustomerId",
                table: "CustomerAddresses");

            migrationBuilder.AlterColumn<string>(
                name: "PostalCode",
                table: "CustomerAddresses",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "AddressLine2",
                table: "CustomerAddresses",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Country",
                table: "CustomerAddresses",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerAddresses_CustomerId_IsDefault",
                table: "CustomerAddresses",
                columns: new[] { "CustomerId", "IsDefault" },
                unique: true,
                filter: "[IsDefault] = 1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CustomerAddresses_CustomerId_IsDefault",
                table: "CustomerAddresses");

            migrationBuilder.DropColumn(
                name: "AddressLine2",
                table: "CustomerAddresses");

            migrationBuilder.DropColumn(
                name: "Country",
                table: "CustomerAddresses");

            migrationBuilder.AlterColumn<string>(
                name: "PostalCode",
                table: "CustomerAddresses",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CustomerAddresses_CustomerId",
                table: "CustomerAddresses",
                column: "CustomerId");
        }
    }
}
