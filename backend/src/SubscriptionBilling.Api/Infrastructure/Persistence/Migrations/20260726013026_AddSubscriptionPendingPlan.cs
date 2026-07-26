using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SubscriptionBilling.Api.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSubscriptionPendingPlan : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PendingPlanId",
                table: "Subscriptions",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Subscriptions_PendingPlanId",
                table: "Subscriptions",
                column: "PendingPlanId");

            migrationBuilder.AddForeignKey(
                name: "FK_Subscriptions_Plans_PendingPlanId",
                table: "Subscriptions",
                column: "PendingPlanId",
                principalTable: "Plans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Subscriptions_Plans_PendingPlanId",
                table: "Subscriptions");

            migrationBuilder.DropIndex(
                name: "IX_Subscriptions_PendingPlanId",
                table: "Subscriptions");

            migrationBuilder.DropColumn(
                name: "PendingPlanId",
                table: "Subscriptions");
        }
    }
}
