const { DataTypes } = require("sequelize");

function initModels(sequelize) {
    console.log("🔄 Đang khởi tạo các bảng trong models.js..."); // Log kiểm tra

    // --- 1. Users & Auth ---
    const User = sequelize.define("User", {
        user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        full_name: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        password: { type: DataTypes.STRING, allowNull: false },
        phone: { type: DataTypes.STRING, unique: true },
        role: { type: DataTypes.STRING, defaultValue: "customer" },
        avatar_url: { type: DataTypes.STRING },
    }, { tableName: "USERS", paranoid: true, createdAt: "created_at", updatedAt: false, deletedAt: "deleted_at" });

    // --- 2. Address ---
    const Address = sequelize.define("Address", {
        address_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        address_detail: { type: DataTypes.STRING, allowNull: false },
        phone: { type: DataTypes.STRING },
        is_default: { type: DataTypes.BOOLEAN, defaultValue: false },
        recipient_name: { type: DataTypes.STRING },
        user_id: { type: DataTypes.INTEGER },
    }, { tableName: "ADDRESSES", timestamps: false });

    // --- 3. Books ---
    const Book = sequelize.define("Book", {
        book_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        book_title: { type: DataTypes.STRING, allowNull: false },
        price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        stock_quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
        publication_year: { type: DataTypes.INTEGER },
        description: { type: DataTypes.TEXT },
        book_slug: { type: DataTypes.STRING, unique: true },
        total_sold: { type: DataTypes.INTEGER, defaultValue: 0 },
        average_rating: { type: DataTypes.FLOAT, defaultValue: 0 },
        isbn: { type: DataTypes.STRING },
        author_id: { type: DataTypes.INTEGER },
        genre_id: { type: DataTypes.INTEGER },
        publisher_id: { type: DataTypes.INTEGER },
    }, { tableName: "BOOKS", paranoid: true, timestamps: false, deletedAt: "deleted_at" });

    const BookImage = sequelize.define("BookImage", {
        book_image_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        book_image_url: { type: DataTypes.STRING, allowNull: false },
        book_id: { type: DataTypes.INTEGER, allowNull: false },
    }, { tableName: "BOOK_IMAGES", timestamps: false });

    const Author = sequelize.define("Author", {
        author_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        author_name: { type: DataTypes.STRING, allowNull: false },
        author_bio: { type: DataTypes.TEXT },
        author_slug: { type: DataTypes.STRING, unique: true },
    }, { tableName: "AUTHORS", timestamps: false });

    const Genre = sequelize.define("Genre", {
        genre_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        genre_name: { type: DataTypes.STRING, allowNull: false },
        genre_slug: { type: DataTypes.STRING, unique: true },
    }, { tableName: "GENRES", timestamps: false });

    const Publisher = sequelize.define("Publisher", {
        publisher_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        publisher_name: { type: DataTypes.STRING, allowNull: false },
        publisher_slug: { type: DataTypes.STRING, unique: true },
    }, { tableName: "PUBLISHERS", timestamps: false });

    // --- 4. Other Models ---
    const Category = sequelize.define("Category", {
        category_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        category_name: { type: DataTypes.STRING, allowNull: false },
        category_slug: { type: DataTypes.STRING, unique: true },
    }, { tableName: "CATEGORIES", timestamps: false });

    const Post = sequelize.define("Post", {
        post_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        title: { type: DataTypes.STRING, allowNull: false },
        post_slug: { type: DataTypes.STRING, unique: true },
        thumbnail_url: { type: DataTypes.STRING },
        content: { type: DataTypes.TEXT },
        status: { type: DataTypes.STRING, defaultValue: "draft" },
        user_id: { type: DataTypes.INTEGER },
        category_id: { type: DataTypes.INTEGER },
    }, { tableName: "POSTS", timestamps: false });

    const Cart = sequelize.define("Cart", {
        cart_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: { type: DataTypes.INTEGER },
    }, { tableName: "CARTS", timestamps: false });

    const CartItem = sequelize.define("CartItem", {
        cart_item_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
        cart_id: { type: DataTypes.INTEGER },
        book_id: { type: DataTypes.INTEGER },
    }, { tableName: "CART_ITEMS", timestamps: false });

    const Voucher = sequelize.define("Voucher", {
        voucher_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        code: { type: DataTypes.STRING, allowNull: false, unique: true },
        discount_type: { type: DataTypes.STRING, defaultValue: "fixed" },
        value: { type: DataTypes.DECIMAL(10, 2) },
        min_order_value: { type: DataTypes.DECIMAL(10, 2) },
        usage_limit: { type: DataTypes.INTEGER },
        start_at: { type: DataTypes.DATE },
        end_at: { type: DataTypes.DATE },
    }, { tableName: "VOUCHERS", timestamps: false });

    const Order = sequelize.define("Order", {
        order_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        final_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        order_status: { type: DataTypes.STRING, defaultValue: "pending" },
        payment_status: { type: DataTypes.STRING },
        user_id: { type: DataTypes.INTEGER },
        shipping_address: { type: DataTypes.INTEGER },
        voucher_id: { type: DataTypes.INTEGER },
    }, { tableName: "ORDERS", paranoid: true, createdAt: "created_at", updatedAt: false, deletedAt: "deleted_at" });

    const OrderItem = sequelize.define("OrderItem", {
        order_item_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        quantity: { type: DataTypes.INTEGER, allowNull: false },
        unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        subtotal: { type: DataTypes.DECIMAL(10, 2) },
        order_id: { type: DataTypes.INTEGER },
        book_id: { type: DataTypes.INTEGER },
    }, { tableName: "ORDER_ITEMS", timestamps: false });

    const Transaction = sequelize.define("Transaction", {
        transaction_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        payment_method: { type: DataTypes.STRING },
        amount: { type: DataTypes.DECIMAL(10, 2) },
        status: { type: DataTypes.STRING },
        payment_info: { type: DataTypes.JSON },
        user_id: { type: DataTypes.INTEGER },
        order_id: { type: DataTypes.INTEGER },
    }, { tableName: "TRANSACTIONS", createdAt: "created_at", updatedAt: false });

    const Review = sequelize.define("Review", {
        review_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        rating: { type: DataTypes.INTEGER, allowNull: false },
        comment: { type: DataTypes.TEXT },
        user_id: { type: DataTypes.INTEGER },
        book_id: { type: DataTypes.INTEGER },
        order_id: { type: DataTypes.INTEGER },
    }, { tableName: "REVIEWS", timestamps: false });

    const ImportReceipt = sequelize.define("ImportReceipt", {
        import_receipt_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        supplier_name: { type: DataTypes.STRING },
        total_cost: { type: DataTypes.DECIMAL(10, 2) },
    }, { tableName: "IMPORT_RECEIPTS", createdAt: "created_at", updatedAt: false });

    const ImportItem = sequelize.define("ImportItem", {
        import_item_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        quantity: { type: DataTypes.INTEGER, allowNull: false },
        import_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        import_receipt_id: { type: DataTypes.INTEGER },
        book_id: { type: DataTypes.INTEGER },
    }, { tableName: "IMPORT_ITEMS", timestamps: false });

    // --- ASSOCIATIONS ---
    Author.hasMany(Book, { foreignKey: "author_id" });
    Book.belongsTo(Author, { foreignKey: "author_id" });

    Genre.hasMany(Book, { foreignKey: "genre_id" });
    Book.belongsTo(Genre, { foreignKey: "genre_id" });

    Publisher.hasMany(Book, { foreignKey: "publisher_id" });
    Book.belongsTo(Publisher, { foreignKey: "publisher_id" });

    Book.hasMany(BookImage, { foreignKey: "book_id" });
    BookImage.belongsTo(Book, { foreignKey: "book_id" });

    User.hasMany(Address, { foreignKey: "user_id" });
    Address.belongsTo(User, { foreignKey: "user_id" });

    User.hasOne(Cart, { foreignKey: "user_id" });
    Cart.belongsTo(User, { foreignKey: "user_id" });

    User.hasMany(Order, { foreignKey: "user_id" });
    Order.belongsTo(User, { foreignKey: "user_id" });

    User.hasMany(Post, { foreignKey: "user_id" });
    Post.belongsTo(User, { foreignKey: "user_id" });

    Cart.hasMany(CartItem, { foreignKey: "cart_id" });
    CartItem.belongsTo(Cart, { foreignKey: "cart_id" });

    Book.hasMany(CartItem, { foreignKey: "book_id" });
    CartItem.belongsTo(Book, { foreignKey: "book_id" });

    Address.hasMany(Order, { foreignKey: "shipping_address" });
    Order.belongsTo(Address, { foreignKey: "shipping_address" });

    Voucher.hasMany(Order, { foreignKey: "voucher_id" });
    Order.belongsTo(Voucher, { foreignKey: "voucher_id" });

    Order.hasMany(OrderItem, { foreignKey: "order_id" });
    OrderItem.belongsTo(Order, { foreignKey: "order_id" });

    Book.hasMany(OrderItem, { foreignKey: "book_id" });
    OrderItem.belongsTo(Book, { foreignKey: "book_id" });

    User.hasMany(Transaction, { foreignKey: "user_id" });
    Transaction.belongsTo(User, { foreignKey: "user_id" });

    Order.hasMany(Transaction, { foreignKey: "order_id" });
    Transaction.belongsTo(Order, { foreignKey: "order_id" });

    User.hasMany(Review, { foreignKey: "user_id" });
    Review.belongsTo(User, { foreignKey: "user_id" });

    Book.hasMany(Review, { foreignKey: "book_id" });
    Review.belongsTo(Book, { foreignKey: "book_id" });

    Order.hasMany(Review, { foreignKey: "order_id" });
    Review.belongsTo(Order, { foreignKey: "order_id" });

    Category.hasMany(Post, { foreignKey: "category_id" });
    Post.belongsTo(Category, { foreignKey: "category_id" });

    ImportReceipt.hasMany(ImportItem, { foreignKey: "import_receipt_id" });
    ImportItem.belongsTo(ImportReceipt, { foreignKey: "import_receipt_id" });

    Book.hasMany(ImportItem, { foreignKey: "book_id" });
    ImportItem.belongsTo(Book, { foreignKey: "book_id" });

    console.log("✅ Models đã được định nghĩa xong!");

    // --- RETURN --- (Phần quan trọng nhất)
    return {
        User, Address, Book, BookImage, Author, Genre, Publisher, Category,
        Post, Cart, CartItem, Voucher, Order, OrderItem, Transaction, Review,
        ImportReceipt, ImportItem
    };
}

module.exports = initModels;