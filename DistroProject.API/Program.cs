using Microsoft.EntityFrameworkCore;
using DistroProject.API.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using OpenApiModels = Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Connection
// Önce environment variable'dan oku (Production için güvenli yol)
// Environment variable adı: ConnectionStrings__DefaultConnection
// Eğer environment variable yoksa appsettings.json / appsettings.Development.json'dan oku
var connectionString =
    Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrEmpty(connectionString))
    throw new InvalidOperationException(
        "Connection string bulunamadı. Lütfen 'ConnectionStrings__DefaultConnection' " +
        "environment variable'ını veya appsettings.json içindeki 'DefaultConnection' değerini tanımlayın.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

// --- CORS SETTINGS (SERVICE DEFINITION) ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()   // Allow requests from any URL
                  .AllowAnyMethod()   // Allow all methods: GET, POST, PUT, DELETE
                  .AllowAnyHeader();  // Allow all headers
        });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddHttpClient(); // For RouteController OSRM calls

// 2. JWT Settings
// JWT secret önce environment variable'dan (JWT__Secret), yoksa appsettings'ten okunur
var jwtSecret =
    Environment.GetEnvironmentVariable("JWT__Secret")
    ?? builder.Configuration["AppSettings:Secret"]
    ?? "B374A26A71448593AA2744749EF41EE3";
var key = Encoding.ASCII.GetBytes(jwtSecret);
builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

// 3. Swagger and Lock Button
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiModels.OpenApiInfo { Title = "Distro API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiModels.OpenApiSecurityScheme
    {
        Description = "JWT Authorization. Example: 'Bearer 12345abcdef'",
        Name = "Authorization",
        In = OpenApiModels.ParameterLocation.Header,
        Type = OpenApiModels.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiModels.OpenApiSecurityRequirement
    {
        {
            new OpenApiModels.OpenApiSecurityScheme
            {
                Reference = new OpenApiModels.OpenApiReference { Type = OpenApiModels.ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] {}
        }
    }
    );
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// --- CORS USAGE (MIDDLEWARE) ---
// Note: UseCors must be after UseRouting and before UseAuthentication.
app.UseHttpsRedirection();

app.UseCors("AllowAll"); // Activating CORS policy here

// Production'da React build dosyalarını (wwwroot) serve et
app.UseDefaultFiles();   // index.html'i varsayılan dosya olarak sun
app.UseStaticFiles();    // wwwroot içindeki tüm statik dosyaları sun

app.UseAuthentication(); 
app.UseAuthorization();  
app.MapControllers();

// SPA Fallback: API dışındaki tüm route'ları React'e yönlendir
// Bu sayede React Router doğru çalışır (örn: /products, /cart gibi sayfalar)
app.MapFallbackToFile("index.html");

app.Run();