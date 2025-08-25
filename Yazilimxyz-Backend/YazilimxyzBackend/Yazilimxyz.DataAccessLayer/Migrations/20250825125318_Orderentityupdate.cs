using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Yazilimxyz.DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class Orderentityupdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MerchantOrders_AppUsers_MerchantId",
                table: "MerchantOrders");

            migrationBuilder.RenameColumn(
                name: "ShippedAt",
                table: "Orders",
                newName: "DeliveredAt");

            migrationBuilder.AddColumn<DateTime>(
                name: "ConfirmedAt",
                table: "Orders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ConfirmedAt",
                table: "MerchantOrders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_MerchantOrders_AppUsers_MerchantId",
                table: "MerchantOrders",
                column: "MerchantId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MerchantOrders_AppUsers_MerchantId",
                table: "MerchantOrders");

            migrationBuilder.DropColumn(
                name: "ConfirmedAt",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "ConfirmedAt",
                table: "MerchantOrders");

            migrationBuilder.RenameColumn(
                name: "DeliveredAt",
                table: "Orders",
                newName: "ShippedAt");

            migrationBuilder.AddForeignKey(
                name: "FK_MerchantOrders_AppUsers_MerchantId",
                table: "MerchantOrders",
                column: "MerchantId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
