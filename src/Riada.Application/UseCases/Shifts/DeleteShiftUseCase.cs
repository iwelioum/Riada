using Riada.Domain.Interfaces.Repositories;

namespace Riada.Application.UseCases.Shifts;

public class DeleteShiftUseCase
{
    private readonly IShiftRepository _shiftRepository;

    public DeleteShiftUseCase(IShiftRepository shiftRepository)
        => _shiftRepository = shiftRepository;

    public async Task<bool> ExecuteAsync(uint id, CancellationToken ct = default)
        => await _shiftRepository.DeleteAsync(id, ct);
}
