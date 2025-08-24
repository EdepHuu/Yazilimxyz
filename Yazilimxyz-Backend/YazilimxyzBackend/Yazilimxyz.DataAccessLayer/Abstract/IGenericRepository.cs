using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.DataAccessLayer.Abstract
{
    public interface IGenericRepository<T> where T : class
    {
        Task<T?> GetByIdAsync(int id);
        Task<IEnumerable<T>> GetAllAsync();
        Task<IEnumerable<T>> FindAsync(Expression<Func<T,bool>> predicate);
        Task<T?> FirstOrDefaultAsync(Expression<Func<T,bool>> predicate);
        Task<T> AddAsync(T entity);
        Task<T> UpdateAsync(T entity);
        Task DeleteAsync(int id);
        Task DeleteAsync(T entity);
        Task<bool> ExistsAsync(int id);
        Task<int> CountAsync(Expression<Func<T, bool>> predicate);
    }
}
