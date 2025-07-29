using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.BusinessLayer.ValidationRules
{
    public class ProductValidator : AbstractValidator<Product>
    {
        public ProductValidator()
        {
            RuleFor(p => p.Name).NotEmpty();
            RuleFor(p => p.Name).MinimumLength(2);
            RuleFor(p => p.BasePrice).NotEmpty();
            RuleFor(p => p.BasePrice).GreaterThan(0);
            RuleFor(p => p.BasePrice).GreaterThanOrEqualTo(10);

        }


    }
}
