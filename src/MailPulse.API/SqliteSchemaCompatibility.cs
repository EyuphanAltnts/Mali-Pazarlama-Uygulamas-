using Microsoft.EntityFrameworkCore;

namespace MailPulse.API;

public static class SqliteSchemaCompatibility
{
    public static async Task ApplyAsync(DbContext context, CancellationToken ct = default)
    {
        var connection = context.Database.GetDbConnection();
        await using var connectionScope = connection;
        await connection.OpenAsync(ct);

        if (!await ColumnExistsAsync(connection, "Users", "Role", ct))
        {
            await ExecuteAsync(connection, "ALTER TABLE \"Users\" ADD COLUMN \"Role\" TEXT NOT NULL DEFAULT 'User';", ct);
            await ExecuteAsync(connection, "UPDATE \"Users\" SET \"Role\" = 'Admin' WHERE \"Email\" = 'admin@mailpulse.com';", ct);
        }

        if (!await TableExistsAsync(connection, "RefreshTokens", ct))
        {
            await ExecuteAsync(connection, """
                CREATE TABLE "RefreshTokens" (
                    "Id" BLOB NOT NULL CONSTRAINT "PK_RefreshTokens" PRIMARY KEY,
                    "UserId" BLOB NOT NULL,
                    "TokenHash" TEXT NOT NULL,
                    "ExpiresAt" TEXT NOT NULL,
                    "RevokedAt" TEXT NULL,
                    "CreatedAt" TEXT NOT NULL,
                    "UpdatedAt" TEXT NULL,
                    CONSTRAINT "FK_RefreshTokens_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
                );
                CREATE UNIQUE INDEX "IX_RefreshTokens_TokenHash" ON "RefreshTokens" ("TokenHash");
                CREATE INDEX "IX_RefreshTokens_UserId" ON "RefreshTokens" ("UserId");
                """, ct);
        }
    }

    private static async Task<bool> ColumnExistsAsync(System.Data.Common.DbConnection connection, string table, string column, CancellationToken ct)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = $"PRAGMA table_info(\"{table}\");";
        await using var reader = await command.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct))
        {
            if (string.Equals(reader.GetString(1), column, StringComparison.OrdinalIgnoreCase))
                return true;
        }

        return false;
    }

    private static async Task<bool> TableExistsAsync(System.Data.Common.DbConnection connection, string table, CancellationToken ct)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = $table;";
        var parameter = command.CreateParameter();
        parameter.ParameterName = "$table";
        parameter.Value = table;
        command.Parameters.Add(parameter);
        return Convert.ToInt32(await command.ExecuteScalarAsync(ct)) > 0;
    }

    private static async Task ExecuteAsync(System.Data.Common.DbConnection connection, string sql, CancellationToken ct)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = sql;
        await command.ExecuteNonQueryAsync(ct);
    }
}