using HiringProjectNew.Server.DTOs.Auth;

namespace HiringProjectNew.Server.Interfaces
{
    public interface IAuthService
    {
        Task<RegisterResponseDto> RegisterAsync(RegisterDto request);

        Task<LoginResponseDto> LoginAsync(LoginDto request);
    }
}