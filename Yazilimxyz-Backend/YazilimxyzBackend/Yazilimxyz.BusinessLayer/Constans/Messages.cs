using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.BusinessLayer.Constans
{
    public static class Messages
    {
        //System Messages
        public static string MaintenanceTime = "Sistem Bakımda.";

        //Category Messages
        public static string TenanceTime = "Sistem şu anda bakımda.";
        public static string CategoryLimitExceeded = "Kategori limiti aşıldı.";
        public static string CategoryNameAlreadyExists = "Bu isimde bir kategori zaten mevcut.";
        public static string CategoryNotFound = "Kategori bulunamadı.";
        public static string CategoriesListed = "Kategoriler başarıyla listelendi.";
        public static string CategoryAdded = "Kategori başarıyla eklendi.";
        public static string CategoryUpdated = "Kategori başarıyla güncellendi.";
        public static string CategoryDeleted = "Kategori başarıyla silindi.";

        //Order Messages
        public static string OrderCreate = "Siparişiniz  Oluşturuldu.";
        public static string OrderNotCreate = "Siparişiniz  Oluşturulamadı.";

        //Product Messages
        public static string ProductAdded = "Ürün eklendi";
        public static string ProductDeleted = "Ürün Silindi";
        public static string ProductUpdated = "Ürün Güncellendi";
        public static string ProductNameInvalid = "Ürün ismi geçersiz";
        public static string ProductsListed = "Ürünler listelendi";
        public static string ProductCountOfCategoryError = "Bir kategoride en fazla 17 ürün olabilir";

        //User Messages
        public static string UserAdded = "Kullanıcı Eklendi";
        public static string UserDeleted = "Kullanıcı Silindi";
        public static string UserUpdated = "Kullanıcı Güncellendi";
        public static string UsersListed = "Kullanıcılar Listelendi";

        //Process Messages
        public static string AuthorizationDenied = "Yetkiniz yok";
        public static string UserRegistered = "Kayıt oldu";
        public static string UserNotFound = "Kullanıcı bulunamadı";
        public static string PasswordError = "Parola hatası";
        public static string SuccessfulLogin = "Başarılı Giriş";
        public static string UserAlreadyExists = "Kullanıcı mevcut";
        public static string AccessTokenCreated = "Token oluşturuldu";

        //ProductImage Messages
        public static string ProductImageLimit = "Bir ürüne yediden fazla resim eklenemez";
        public static string ProductImageDeleted = "Resim silindi";
        public static string ProductImageUpdated = "Resim güncellendi";
        public static string ProductImageAdded = "Resim eklendi";

        //...





    }
}
