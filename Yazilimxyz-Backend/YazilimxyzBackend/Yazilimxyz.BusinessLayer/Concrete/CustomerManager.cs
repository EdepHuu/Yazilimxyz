
﻿using AutoMapper;
using Core.Aspects.Autofac.Caching;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.Customer;
using Yazilimxyz.DataAccessLayer.Abstract;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.BusinessLayer.Concrete

{
    public class CustomerManager : ICustomerService
    {
        private readonly ICustomerRepository _customerRepository;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _http;

        public CustomerManager(ICustomerRepository customerRepository, IMapper mapper, IHttpContextAccessor http)
        {
            _customerRepository = customerRepository;
            _mapper = mapper;
            _http = http;
        }

        // -------- SELF --------
        [CacheAspect] // key, value
        public async Task<ResultCustomerDto?> GetMyProfileAsync()
        {
            var userId = _http.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return null;
            }
            var customer = await _customerRepository.GetByAppUserIdWithUserAndAddressesAsync(userId);
            return _mapper.Map<ResultCustomerDto?>(customer);
        }

        // -------- ADMIN --------
        [CacheAspect] // key, value
        public async Task<ResultCustomerDto?> GetByIdAsync(int id)
        {
            var customer = await _customerRepository.GetByIdWithUserAsync(id);
            return _mapper.Map<ResultCustomerDto?>(customer);
        }

        [CacheAspect] // key, value
        public async Task<ResultCustomerDto?> GetByAppUserIdAsync(string appUserId)
        {
            var customer = await _customerRepository.GetByAppUserIdWithUserAsync(appUserId);
            return _mapper.Map<ResultCustomerDto?>(customer);
        }

        [CacheAspect] // key, value
        public async Task<ResultCustomerWithAddressesDto?> GetWithAddressesAsync(int id)
        {
            var customer = await _customerRepository.GetWithAddressesAsync(id);
            return _mapper.Map<ResultCustomerWithAddressesDto?>(customer);
        }

        [CacheRemoveAspect("ICustomerService.Get")]
        public async Task AdminCreateAsync(AdminCreateCustomerDto dto)
        {
            if (dto == null)
            {
                throw new ArgumentException("Geçersiz istek.");
            }
            if (string.IsNullOrWhiteSpace(dto.AppUserId))
            {
                throw new ArgumentException("AppUserId zorunludur.");
            }
            var exists = await _customerRepository.GetByAppUserIdAsync(dto.AppUserId);
            if (exists != null)
            {
                throw new ArgumentException("Bu kullanıcı için müşteri kaydı zaten var.");
            }
            var entity = new Customer
            {
                AppUserId = dto.AppUserId
            };
            await _customerRepository.AddAsync(entity);
        }

        [CacheRemoveAspect("ICustomerService.Get")]
        public async Task AdminSetActiveAsync(int id, bool isActive)
        {
            if (id <= 0)
            {
                throw new ArgumentException("Geçersiz id.");
            }
            await _customerRepository.SetActiveAsync(id, isActive);
        }

        // -------- REGISTER --------
        [CacheRemoveAspect("ICustomerService.Get")]
        public async Task CreateForUserAsync(string appUserId)
        {
            if (string.IsNullOrWhiteSpace(appUserId))
            {
                throw new ArgumentException("AppUserId zorunludur.");
            }
            var exists = await _customerRepository.GetByAppUserIdAsync(appUserId);
            if (exists != null)
            {
                throw new ArgumentException("Bu kullanıcı için müşteri kaydı zaten var.");
            }
            await _customerRepository.AddAsync(new Customer { AppUserId = appUserId });
        }

    }

    }

}