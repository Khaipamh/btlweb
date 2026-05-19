// backend/src/seed.js
const { sequelize, models } = require('./config/database');
const bcrypt = require('bcrypt');

// Load models
const { 
    User, Book, Author, Genre, Publisher, 
    Cart, BookImage, Category, Post, Voucher, Review,
    Address, Order, OrderItem, Transaction
} = models;

const seed = async () => {
    let t;

    try {
        await sequelize.authenticate();
        console.log("🔌 Database connected. Starting safe seed with Transaction...");

        t = await sequelize.transaction();

        // 1. Reset DB
        await sequelize.sync({ force: true }); 
        console.log("🗑️  Database cleared.");

        // =============================================
        // 2. USERS
        // =============================================
        console.log("👤 Creating Users...");
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('123456', salt);
        
        const usersData = [
            { full_name: 'Admin User', email: 'admin@sahafa.com', password: hash, role: 'admin', phone: '0901000001' },
            { full_name: 'Staff Member', email: 'staff@sahafa.com', password: hash, role: 'employee', phone: '0901000002' },
            { full_name: 'Normal Customer', email: 'user@sahafa.com', password: hash, role: 'customer', phone: '0901000003' }
        ];

        const createdUsers = [];
        for (const u of usersData) {
            const user = await User.create(u, { transaction: t });
            createdUsers.push(user);
            // Create Cart for each user
            await Cart.create({ user_id: user.user_id }, { transaction: t });
            
            // Create default address for customer
            if (u.role === 'customer') {
                await Address.create({
                    user_id: user.user_id,
                    recipient_name: u.full_name,
                    phone: u.phone,
                    address_detail: '123 Nguyen Van Linh, District 7, HCMC',
                    is_default: true
                }, { transaction: t });
            }
        }

        // =============================================
        // 3. MASTER DATA (Authors, Genres, Publishers, Categories)
        // =============================================
        console.log("📚 Creating Master Data...");

        // Genres
        const genreNames = [
            'Fiction', 'Science Fiction', 'Mystery', 'Romance', 'Horror', 
            'Self-Help', 'Business', 'History', 'Biography', 'Fantasy'
        ];
        const genreMap = {}; // name -> id
        for (const name of genreNames) {
            const slug = name.toLowerCase().replace(/ /g, '-')
            const g = await Genre.create({ genre_name: name, genre_slug: slug }, { transaction: t });
            genreMap[name] = g.genre_id;
        }

        // Publishers
        const publisherNames = ['Penguin Random House', 'HarperCollins', 'Simon & Schuster', 'NXB Tre', 'NXB Kim Dong'];
        const publisherMap = {};
        for (const name of publisherNames) {
            const slug = name.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
            const p = await Publisher.create({ publisher_name: name, publisher_slug: slug }, { transaction: t });
            publisherMap[name] = p.publisher_id;
        }

        // Authors
        const authorsData = [
            { name: 'J.K. Rowling', bio: 'British author, philanthropist, film producer, television producer, and screenwriter.' },
            { name: 'Stephen King', bio: 'American author of horror, supernatural fiction, suspense, crime, science-fiction, and fantasy novels.' },
            { name: 'Haruki Murakami', bio: 'Japanese writer. His books and stories have been bestsellers in Japan as well as internationally.' },
            { name: 'George Orwell', bio: 'English novelist, essayist, journalist and critic.' },
            { name: 'Agatha Christie', bio: 'English writer known for her sixty-six detective novels and fourteen short story collections.' },
            { name: 'Walter Isaacson', bio: 'American author, journalist, and professor.' },
            { name: 'Dale Carnegie', bio: 'American writer and lecturer, and the developer of courses in self-improvement.' },
            { name: 'Yuval Noah Harari', bio: 'Israeli public intellectual, historian and a professor in the Department of History at the Hebrew University of Jerusalem.' },
            { name: 'Tolkien', bio: 'English writer, poet, philologist, and academic.' },
            { name: 'Paulo Coelho', bio: 'Brazilian lyricist and novelist.' }
        ];
        const authorMap = {};
        for (const a of authorsData) {
            const slug = a.name.toLowerCase().replace(/ /g, '-').replace(/\./g, '');
            const author = await Author.create({ author_name: a.name, author_bio: a.bio, author_slug: slug }, { transaction: t });
            authorMap[a.name] = author.author_id;
        }

        // Post Categories
        const categoryNames = ['News', 'Events', 'Promotions', 'Reviews'];
        const categoryMap = {};
        for (const name of categoryNames) {
            const slug = name.toLowerCase().replace(/ /g, '-');
            const c = await Category.create({ category_name: name, category_slug: slug }, { transaction: t });
            categoryMap[name] = c.category_id;
        }

        // =============================================
        // 4. BOOKS
        // =============================================
        console.log("📖 Creating Books...");

        const booksData = [
            {
                title: 'Harry Potter and the Sorcerer\'s Stone',
                price: 150000,
                stock: 100,
                year: 1997,
                desc: 'Harry Potter has never even heard of Hogwarts when the letters start dropping on the doormat at number four, Privet Drive.',
                slug: 'harry-potter-1',
                isbn: '978-0747532743',
                author: 'J.K. Rowling',
                genre: 'Fantasy',
                publisher: 'Penguin Random House',
                rating: 4.8
            },
            {
                title: 'It',
                price: 200000,
                stock: 50,
                year: 1986,
                desc: 'The story follows the experiences of seven children as they are terrorized by an evil entity that exploits the fears of its victims.',
                slug: 'it-stephen-king',
                isbn: '978-1501142970',
                author: 'Stephen King',
                genre: 'Horror',
                publisher: 'Simon & Schuster',
                rating: 4.5
            },
            {
                title: 'Norwegian Wood',
                price: 120000,
                stock: 80,
                year: 1987,
                desc: 'A magnificent blending of the music, the mood, and the ethos that were the sixties with a young man\'s hopeless and heroic first love.',
                slug: 'norwegian-wood',
                isbn: '978-0375704024',
                author: 'Haruki Murakami',
                genre: 'Romance',
                publisher: 'HarperCollins',
                rating: 4.3
            },
            {
                title: '1984',
                price: 110000,
                stock: 120,
                year: 1949,
                desc: 'Among the seminal texts of the 20th century, Nineteen Eighty-Four is a rare work that grows more haunting as its futuristic purgatory becomes more real.',
                slug: '1984-george-orwell',
                isbn: '978-0451524935',
                author: 'George Orwell',
                genre: 'Science Fiction',
                publisher: 'Penguin Random House',
                rating: 4.7
            },
            {
                title: 'Murder on the Orient Express',
                price: 130000,
                stock: 60,
                year: 1934,
                desc: 'Just after midnight, the famous Orient Express is stopped in its tracks by a snowdrift. By morning, the millionaire Samuel Edward Ratchett lies dead.',
                slug: 'murder-on-the-orient-express',
                isbn: '978-0062073501',
                author: 'Agatha Christie',
                genre: 'Mystery',
                publisher: 'HarperCollins',
                rating: 4.6
            },
            {
                title: 'Steve Jobs',
                price: 250000,
                stock: 30,
                year: 2011,
                desc: 'Based on more than forty interviews with Jobs conducted over two years, as well as interviews with more than a hundred family members, friends, adversaries, competitors, and colleagues.',
                slug: 'steve-jobs',
                isbn: '978-1451648539',
                author: 'Walter Isaacson',
                genre: 'Biography',
                publisher: 'Simon & Schuster',
                rating: 4.8
            },
            {
                title: 'How to Win Friends and Influence People',
                price: 90000,
                stock: 200,
                year: 1936,
                desc: 'You can go after the job you want—and get it! You can take the job you have—and improve it! You can take any situation—and make it work for you!',
                slug: 'how-to-win-friends',
                isbn: '978-0671027032',
                author: 'Dale Carnegie',
                genre: 'Self-Help',
                publisher: 'Simon & Schuster',
                rating: 4.9
            },
            {
                title: 'Sapiens: A Brief History of Humankind',
                price: 180000,
                stock: 90,
                year: 2011,
                desc: 'From a renowned historian comes a groundbreaking narrative of humanity’s creation and evolution—a #1 international bestseller.',
                slug: 'sapiens',
                isbn: '978-0062316097',
                author: 'Yuval Noah Harari',
                genre: 'History',
                publisher: 'HarperCollins',
                rating: 4.7
            },
            {
                title: 'The Hobbit',
                price: 140000,
                stock: 75,
                year: 1937,
                desc: 'A great modern classic and the prelude to The Lord of the Rings.',
                slug: 'the-hobbit',
                isbn: '978-0547928227',
                author: 'Tolkien',
                genre: 'Fantasy',
                publisher: 'HarperCollins',
                rating: 4.8
            },
            {
                title: 'The Alchemist',
                price: 100000,
                stock: 150,
                year: 1988,
                desc: 'Combining magic, mysticism, wisdom and wonder into an inspiring tale of self-discovery, The Alchemist has become a modern classic.',
                slug: 'the-alchemist',
                isbn: '978-0062315007',
                author: 'Paulo Coelho',
                genre: 'Fiction',
                publisher: 'HarperCollins',
                rating: 4.4
            },
            // --- 20 NEW BOOKS ---
            {
                title: 'The Shining',
                price: 180000,
                stock: 60,
                year: 1977,
                desc: 'Jack Torrance\'s new job at the Overlook Hotel is the perfect chance for a fresh start.',
                slug: 'the-shining',
                isbn: '978-0307743657',
                author: 'Stephen King',
                genre: 'Horror',
                publisher: 'Simon & Schuster',
                rating: 4.6
            },
            {
                title: 'Kafka on the Shore',
                price: 140000,
                stock: 70,
                year: 2002,
                desc: 'A teenage boy, Kafka Tamura, runs away from home either to escape a gruesome edictal prophecy or to search for his long-missing mother and sister.',
                slug: 'kafka-on-the-shore',
                isbn: '978-1400079278',
                author: 'Haruki Murakami',
                genre: 'Fantasy',
                publisher: 'HarperCollins',
                rating: 4.4
            },
            {
                title: 'Animal Farm',
                price: 90000,
                stock: 150,
                year: 1945,
                desc: 'A farm is taken over by its overworked, mistreated animals. With flaming idealism and stirring slogans, they set out to create a paradise of progress.',
                slug: 'animal-farm',
                isbn: '978-0451526342',
                author: 'George Orwell',
                genre: 'Fiction',
                publisher: 'Penguin Random House',
                rating: 4.5
            },
            {
                title: 'And Then There Were None',
                price: 120000,
                stock: 90,
                year: 1939,
                desc: 'Ten strangers are summoned to a remote island. All that the guests have in common is a wicked past they\'re unwilling to reveal.',
                slug: 'and-then-there-were-none',
                isbn: '978-0062073488',
                author: 'Agatha Christie',
                genre: 'Mystery',
                publisher: 'HarperCollins',
                rating: 4.8
            },
            {
                title: 'Leonardo da Vinci',
                price: 280000,
                stock: 40,
                year: 2017,
                desc: 'He was history\'s most creative genius. What secrets can he teach us? The author of the acclaimed bestsellers Steve Jobs and Einstein.',
                slug: 'leonardo-da-vinci',
                isbn: '978-1501139154',
                author: 'Walter Isaacson',
                genre: 'Biography',
                publisher: 'Simon & Schuster',
                rating: 4.7
            },
            {
                title: '21 Lessons for the 21st Century',
                price: 190000,
                stock: 85,
                year: 2018,
                desc: 'Yuval Noah Harari takes us on a thrilling journey through today’s most urgent issues.',
                slug: '21-lessons-21st-century',
                isbn: '978-0525512172',
                author: 'Yuval Noah Harari',
                genre: 'History',
                publisher: 'HarperCollins',
                rating: 4.6
            },
            {
                title: 'The Lord of the Rings',
                price: 350000,
                stock: 30,
                year: 1954,
                desc: 'One Ring to rule them all, One Ring to find them, One Ring to bring them all and in the darkness bind them.',
                slug: 'lord-of-the-rings',
                isbn: '978-0544003415',
                author: 'Tolkien',
                genre: 'Fantasy',
                publisher: 'HarperCollins',
                rating: 4.9
            },
            {
                title: 'Veronika Decides to Die',
                price: 110000,
                stock: 100,
                year: 1998,
                desc: 'Twenty-four-year-old Veronika seems to have everything... yet she is not happy.',
                slug: 'veronika-decides-to-die',
                isbn: '978-0060955746',
                author: 'Paulo Coelho',
                genre: 'Fiction',
                publisher: 'HarperCollins',
                rating: 4.3
            },
            {
                title: 'Harry Potter and the Chamber of Secrets',
                price: 160000,
                stock: 95,
                year: 1998,
                desc: 'The Dursleys were so mean and hideous that summer that all Harry Potter wanted was to get back to the Hogwarts School.',
                slug: 'harry-potter-2',
                isbn: '978-0439064873',
                author: 'J.K. Rowling',
                genre: 'Fantasy',
                publisher: 'Penguin Random House',
                rating: 4.7
            },
            {
                title: 'Pet Sematary',
                price: 195000,
                stock: 45,
                year: 1983,
                desc: 'When Dr. Louis Creed takes a new job and moves his family to the idyllic rural town of Ludlow, Maine, this new beginning seems too good to be true.',
                slug: 'pet-sematary',
                isbn: '978-1501156700',
                author: 'Stephen King',
                genre: 'Horror',
                publisher: 'Simon & Schuster',
                rating: 4.4
            },
            {
                title: '1Q84',
                price: 220000,
                stock: 55,
                year: 2009,
                desc: 'The year is 1984 and the city is Tokyo. A young woman named Aomame follows a taxi driver’s enigmatic suggestion.',
                slug: '1q84',
                isbn: '978-0307593313',
                author: 'Haruki Murakami',
                genre: 'Fantasy',
                publisher: 'HarperCollins',
                rating: 4.2
            },
            {
                title: 'The ABC Murders',
                price: 125000,
                stock: 75,
                year: 1936,
                desc: 'There\'s a serial killer on the loose, working his way through the alphabet and the whole country is in a state of panic.',
                slug: 'the-abc-murders',
                isbn: '978-0062073587',
                author: 'Agatha Christie',
                genre: 'Mystery',
                publisher: 'HarperCollins',
                rating: 4.5
            },
            {
                title: 'Einstein: His Life and Universe',
                price: 260000,
                stock: 35,
                year: 2007,
                desc: 'How did his mind work? What made him a genius? Isaacson’s biography shows how his scientific imagination sprang from the rebellious nature of his personality.',
                slug: 'einstein-life-universe',
                isbn: '978-0743264730',
                author: 'Walter Isaacson',
                genre: 'Biography',
                publisher: 'Simon & Schuster',
                rating: 4.8
            },
            {
                title: 'Homo Deus: A Brief History of Tomorrow',
                price: 185000,
                stock: 80,
                year: 2015,
                desc: 'Yuval Noah Harari envisions a not-too-distant world in which we face a new set of challenges.',
                slug: 'homo-deus',
                isbn: '978-0062464316',
                author: 'Yuval Noah Harari',
                genre: 'History',
                publisher: 'HarperCollins',
                rating: 4.5
            },
            {
                title: 'The Silmarillion',
                price: 155000,
                stock: 60,
                year: 1977,
                desc: 'The Silmarillion is the core of J.R.R. Tolkien\'s imaginative writing, a work that he could not publish in his lifetime.',
                slug: 'the-silmarillion',
                isbn: '978-0618391110',
                author: 'Tolkien',
                genre: 'Fantasy',
                publisher: 'HarperCollins',
                rating: 4.6
            },
            {
                title: 'Eleven Minutes',
                price: 105000,
                stock: 120,
                year: 2003,
                desc: 'Eleven Minutes is the story of Maria, a young girl from a Brazilian village, whose first innocent brushes with love leave her heartbroken.',
                slug: 'eleven-minutes',
                isbn: '978-0060589286',
                author: 'Paulo Coelho',
                genre: 'Romance',
                publisher: 'HarperCollins',
                rating: 4.1
            },
            {
                title: 'Harry Potter and the Prisoner of Azkaban',
                price: 170000,
                stock: 90,
                year: 1999,
                desc: 'For twelve long years, the dread fortress of Azkaban held an infamous prisoner named Sirius Black.',
                slug: 'harry-potter-3',
                isbn: '978-0439136358',
                author: 'J.K. Rowling',
                genre: 'Fantasy',
                publisher: 'Penguin Random House',
                rating: 4.9
            },
            {
                title: 'Misery',
                price: 190000,
                stock: 50,
                year: 1987,
                desc: 'Paul Sheldon is a bestselling novelist who has finally met his number one fan.',
                slug: 'misery',
                isbn: '978-1501143106',
                author: 'Stephen King',
                genre: 'Horror',
                publisher: 'Simon & Schuster',
                rating: 4.7
            },
            {
                title: 'Men Without Women',
                price: 130000,
                stock: 65,
                year: 2014,
                desc: 'Across seven tales, Haruki Murakami brings his powers of observation to bear on the lives of men who, in their own ways, find themselves alone.',
                slug: 'men-without-women',
                isbn: '978-0385352109',
                author: 'Haruki Murakami',
                genre: 'Fiction',
                publisher: 'HarperCollins',
                rating: 4.0
            },
            {
                title: 'The Murder of Roger Ackroyd',
                price: 135000,
                stock: 70,
                year: 1926,
                desc: 'Roger Ackroyd knew too much. He knew that the woman he loved had poisoned her brutal first husband.',
                slug: 'murder-of-roger-ackroyd',
                isbn: '978-0062073563',
                author: 'Agatha Christie',
                genre: 'Mystery',
                publisher: 'HarperCollins',
                rating: 4.8
            }
        ];

        for (const b of booksData) {
            const newBook = await Book.create({
                book_title: b.title,
                price: b.price,
                stock_quantity: b.stock,
                publication_year: b.year,
                description: b.desc,
                book_slug: b.slug,
                total_sold: Math.floor(Math.random() * 50),
                average_rating: b.rating,
                isbn: b.isbn,
                author_id: authorMap[b.author],
                genre_id: genreMap[b.genre],
                publisher_id: publisherMap[b.publisher]
            }, { transaction: t });

            // Create Image
            await BookImage.create({
                book_image_url: 'https://placehold.co/400x600?text=' + encodeURIComponent(b.title),
                book_id: newBook.book_id
            }, { transaction: t });

            // Create some random reviews
            const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
            await Review.create({
                user_id: randomUser.user_id,
                book_id: newBook.book_id,
                rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
                comment: 'Great book! Highly recommended.'
            }, { transaction: t });
        }

        // =============================================
        // 5. OTHER DATA (Vouchers, Posts)
        // =============================================
        console.log("🎫 Creating Vouchers & Posts...");

        await Voucher.create({
            code: 'WELCOME10',
            discount_type: 'percent',
            value: 10,
            min_order_value: 0,
            usage_limit: 1000,
            start_at: new Date(),
            end_at: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        }, { transaction: t });

        await Voucher.create({
            code: 'SALE50K',
            discount_type: 'fixed',
            value: 50000,
            min_order_value: 200000,
            usage_limit: 100,
            start_at: new Date(),
            end_at: new Date(new Date().setMonth(new Date().getMonth() + 1))
        }, { transaction: t });

        // Posts
        const adminUser = createdUsers.find(u => u.role === 'admin');
        await Post.create({
            title: 'Grand Opening Sahafa Bookstore',
            post_slug: 'grand-opening',
            thumbnail_url: 'https://placehold.co/800x400?text=Grand+Opening',
            content: 'Welcome to Sahafa Bookstore. We are happy to serve you with the best books from around the world.',
            status: 'published',
            user_id: adminUser.user_id,
            category_id: categoryMap['News']
        }, { transaction: t });

        await Post.create({
            title: 'Top 10 Books of 2024',
            post_slug: 'top-10-books-2024',
            thumbnail_url: 'https://placehold.co/800x400?text=Top+10',
            content: 'Here are the top 10 books you must read in 2024...',
            status: 'published',
            user_id: adminUser.user_id,
            category_id: categoryMap['Reviews']
        }, { transaction: t });

        // =============================================
        // 6. FAKE ORDERS (REVENUE DATA)
        // =============================================
        console.log("💰 Creating Fake Orders & Revenue...");
        
        // Tạo đơn hàng rải rác trong 6 tháng qua
        const now = new Date();
        const createdBooks = await Book.findAll({ transaction: t }); // Lấy danh sách sách để bán
        
        // Hàm random date
        const randomDate = (start, end) => {
            return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        };

        for (let i = 0; i < 60; i++) { // Tạo 60 đơn hàng giả
            const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
            const userAddress = await Address.findOne({ where: { user_id: user.user_id }, transaction: t });
            
            // Random ngày trong 6 tháng qua
            const pastDate = new Date();
            pastDate.setMonth(now.getMonth() - 6);
            const orderDate = randomDate(pastDate, now);

            // Random 1-5 cuốn sách cho mỗi đơn
            const numItems = Math.floor(Math.random() * 5) + 1;
            let totalAmount = 0;
            const orderItemsData = [];

            for (let j = 0; j < numItems; j++) {
                const book = createdBooks[Math.floor(Math.random() * createdBooks.length)];
                const qty = Math.floor(Math.random() * 3) + 1;
                const price = parseFloat(book.price);
                const subtotal = qty * price;
                
                totalAmount += subtotal;
                orderItemsData.push({
                    book_id: book.book_id,
                    quantity: qty,
                    unit_price: price,
                    subtotal: subtotal
                });
            }

            // Tạo Order
            const order = await Order.create({
                user_id: user.user_id,
                total_amount: totalAmount,
                final_amount: totalAmount, // Giả sử chưa tính voucher
                order_status: 'delivered', // Đã giao hàng -> tính vào doanh thu
                payment_status: 'paid',
                shipping_address: userAddress ? userAddress.address_id : null,
                created_at: orderDate // Override created_at để fake lịch sử
            }, { transaction: t });

            // Tạo Order Items
            for (const item of orderItemsData) {
                await OrderItem.create({
                    order_id: order.order_id,
                    ...item
                }, { transaction: t });
            }

            // Tạo Transaction (Thanh toán)
            await Transaction.create({
                user_id: user.user_id,
                order_id: order.order_id,
                payment_method: Math.random() > 0.5 ? 'cod' : 'vnpay',
                amount: totalAmount,
                status: 'success',
                payment_info: { bank: 'NCB', cardType: 'ATM' },
                created_at: orderDate
            }, { transaction: t });
        }

        await t.commit();
        console.log("✅ SEEDING COMPLETED SUCCESSFULLY!");

    } catch (error) {
        if (t) await t.rollback();
        console.error("❌ Seeding Failed (Rolled back):", error);
    }
};

seed();
