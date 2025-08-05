using Core.Utilities.IoC;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Core.CrossCuttingConcerns.Caching.Microsoft
{
    public class MemoryCacheManager : ICacheManager
    {
        //Adapter Pattern
        IMemoryCache _memoryCache;
        public MemoryCacheManager()
        {
            _memoryCache = ServiceTool.ServiceProvider.GetService<IMemoryCache>();
        }

        public void Add(string key, object value, int duration)
        {
            _memoryCache.Set(key, value, TimeSpan.FromMinutes(duration));
        }

        public T Get<T>(string key)
        {
            return _memoryCache.Get<T>(key);  //İstediğimiz türde keyi getirir.
        }

        public object Get(string key)
        {
            return _memoryCache.Get(key);  //key'i getirir
        }

        public bool IsAdd(string key)
        {
            return _memoryCache.TryGetValue(key, out _);  //bellekte varmı yokmu kontrolü yapar 
        }

        public void Remove(string key)
        {
            _memoryCache.Remove(key);
        }

        public void RemoveByPattern(string pattern)
        {
            var cache = _memoryCache as MemoryCache;

            if (cache == null)
                return;

            var entries = cache
                .GetType()
                .GetProperty("EntriesCollection", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
                ?.GetValue(cache) as dynamic;

            if (entries == null)
                return;

            List<ICacheEntry> cacheEntries = new List<ICacheEntry>();

            foreach (var entry in entries)
            {
                ICacheEntry cacheItem = entry.GetType().GetProperty("Value")?.GetValue(entry, null);
                if (cacheItem != null)
                {
                    cacheEntries.Add(cacheItem);
                }
            }

            var regex = new Regex(pattern, RegexOptions.Singleline | RegexOptions.Compiled | RegexOptions.IgnoreCase);

            var keysToRemove = cacheEntries
                .Where(entry => regex.IsMatch(entry.Key.ToString()))
                .Select(entry => entry.Key)
                .ToList();

            foreach (var key in keysToRemove)
            {
                _memoryCache.Remove(key);
            }
        }

    }
}