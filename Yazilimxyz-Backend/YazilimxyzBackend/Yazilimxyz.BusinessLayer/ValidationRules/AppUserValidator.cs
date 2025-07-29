using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.BusinessLayer.ValidationRules
{
    public class AppUserValidator : AbstractValidator<AppUser>
    {
        public AppUserValidator()
        {
            RuleFor(u => u.Name).NotEmpty();
            RuleFor(u => u.Name).MinimumLength(2);
            RuleFor(u => u.LastName).NotEmpty();
        }
    }
}
