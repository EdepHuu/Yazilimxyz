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

        // Order Messages
        public static string OrderAdded = "Sipariş başarıyla oluşturuldu.";
        public static string OrderNotAdded = "Sipariş oluşturulamadı.";
        public static string OrderUpdated = "Sipariş başarıyla güncellendi.";
        public static string OrderNotUpdated = "Sipariş güncellenemedi.";
        public static string OrderDeleted = "Sipariş başarıyla silindi.";
        public static string OrderNotDeleted = "Sipariş silinemedi.";
        public static string OrderNotFound = "Sipariş bulunamadı.";
        public static string OrdersListed = "Siparişler başarıyla listelendi.";
        public static string OrderRetrieved = "Sipariş başarıyla getirildi.";

        //OrderItem Messages
        public static string OrderItemAdded = "Sipariş kalemi başarıyla eklendi.";
        public static string OrderItemUpdated = "Sipariş kalemi başarıyla güncellendi.";
        public static string OrderItemDeleted = "Sipariş kalemi başarıyla silindi.";
        public static string OrderItemNotFound = "Sipariş kalemi bulunamadı.";
        public static string OrderItemsListed = "Sipariş kalemleri başarıyla listelendi.";

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

        // CartItem Messages
        public static string CartItemAdded = "Sepete ürün başarıyla eklendi.";
        public static string CartItemUpdated = "Sepet ürünü başarıyla güncellendi.";
        public static string CartItemDeleted = "Sepet ürünü başarıyla silindi.";
        public static string CartItemNotFound = "Sepet ürünü bulunamadı.";
        public static string CartCleared = "Kullanıcının sepeti temizlendi.";
        public static string CartItemAlreadyExists = "Bu ürün sepette zaten mevcut.";
        public static string CartItemQuantityInvalid = "Geçersiz ürün adedi.";
        public static string CartItemCountRetrieved = "Sepet ürünü sayısı başarıyla alındı.";

        // CustomerAddress Messages
        public static string CustomerAddressAdded = "Müşteri adresi başarıyla eklendi.";
        public static string CustomerAddressUpdated = "Müşteri adresi başarıyla güncellendi.";
        public static string CustomerAddressDeleted = "Müşteri adresi başarıyla silindi.";
        public static string CustomerAddressNotFound = "Müşteri adresi bulunamadı.";
        public static string CustomerAddressesListed = "Müşteri adresleri başarıyla listelendi.";
        public static string DefaultAddressSet = "Varsayılan adres başarıyla ayarlandı.";
        public static string DefaultAddressNotFound = "Varsayılan adres bulunamadı.";
        public static string InvalidCustomerId = "Geçersiz müşteri Id.";
        public static string InvalidAddressId = "Geçersiz adres Id.";

        // Customer Messages
        public static string CustomerAdded = "Müşteri başarıyla eklendi.";
        public static string CustomerUpdated = "Müşteri başarıyla güncellendi.";
        public static string CustomerDeleted = "Müşteri başarıyla silindi.";
        public static string CustomerNotFound = "Müşteri bulunamadı.";
        public static string CustomersListed = "Müşteriler başarıyla listelendi.";
        public static string CustomerProfileRetrieved = "Müşteri profili başarıyla getirildi.";
        public static string CustomerAlreadyExists = "Bu müşteri zaten mevcut.";


        // Merchant Messages
        public static string MerchantAdded = "Satıcı başarıyla eklendi.";
        public static string MerchantUpdated = "Satıcı başarıyla güncellendi.";
        public static string MerchantDeleted = "Satıcı başarıyla silindi.";
        public static string MerchantNotFound = "Satıcı bulunamadı.";
        public static string MerchantsListed = "Satıcılar başarıyla listelendi.";
        public static string MerchantProfileRetrieved = "Satıcı profili başarıyla getirildi.";
        public static string MerchantAlreadyExists = "Bu satıcı zaten mevcut.";
        public static string InvalidMerchantId = "Geçersiz satıcı Id.";
    }
}
