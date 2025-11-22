# Forum Screen - Màn hình Diễn đàn

## Tổng quan
Màn hình Diễn đàn (Forum Screen) được xây dựng bằng React Native với TypeScript, cho phép người dùng xem và lọc các bài viết theo danh mục.

## Cấu trúc Components

### 1. **ForumScreen** (`src/screens/ForumScreen.tsx`)
Màn hình chính hiển thị danh sách bài viết với các tính năng:
- ✅ Tải danh sách bài viết từ API `getPosts`
- ✅ Phân trang (pagination) và tải thêm khi cuộn
- ✅ Pull-to-refresh để làm mới dữ liệu
- ✅ Lọc bài viết theo category (Tất cả, BLOG, TIN TỨC)
- ✅ Hiển thị trạng thái: Loading, Error, Empty
- ✅ Xử lý lỗi với nút "Thử lại"

### 2. **PostItem** (`src/components/ui/Forum/PostItem.tsx`)
Component hiển thị từng bài viết với:
- 📸 Ảnh thumbnail (lấy từ `image_urls[0]` hoặc placeholder)
- 📝 Tiêu đề bài viết (in đậm)
- 📄 Mô tả ngắn/excerpt (100 ký tự đầu)
- 🏷️ Chip category (BLOG hoặc NEW) với màu sắc khác nhau
- 📅 Ngày đăng (format: DD/MM/YYYY)
- 👤 Thông tin tác giả (avatar và tên)

### 3. **CategoryFilterChips** (`src/components/ui/Forum/CategoryFilterChips.tsx`)
Component hiển thị các chip filter:
- "Tất cả" - hiển thị toàn bộ bài viết
- "BLOG" - chỉ hiển thị bài viết category BLOG
- "TIN TỨC" - chỉ hiển thị bài viết category NEW
- Chip đang chọn có style khác biệt (background xanh, text trắng)

## Cấu trúc dữ liệu

### Post Interface
```typescript
interface Post {
    post_id: string;
    author_id: string;
    author_name: string;
    author_avatar: string;
    title: string;
    content: string;
    image_urls: string[];
    category: PostCategory;
    createdAt?: string;
    updatedAt?: string;
}
```

### PostCategory Enum
```typescript
enum PostCategory {
    BLOG,    // Bài viết blog
    NEW      // Tin tức
}
```

## API Integration

### getPosts
```typescript
getPosts(page: number, size: number): Promise<CustomApiResponse<Post[]>>
```
- **page**: Số trang (bắt đầu từ 0)
- **size**: Số lượng bài viết mỗi trang (mặc định: 10)

## Tính năng chính

### 1. Filtering
- Người dùng có thể lọc bài viết theo 3 loại:
  - **Tất cả**: Hiển thị toàn bộ bài viết
  - **BLOG**: Chỉ hiển thị bài có `category = PostCategory.BLOG`
  - **TIN TỨC**: Chỉ hiển thị bài có `category = PostCategory.NEW`

### 2. Pagination
- Tự động tải thêm bài viết khi cuộn gần cuối danh sách
- `onEndReachedThreshold={0.5}` - tải khi còn 50% cuộn

### 3. Pull to Refresh
- Kéo xuống để làm mới danh sách
- Reset về trang đầu tiên

### 4. Trạng thái UI

#### Loading
- Hiển thị `ActivityIndicator` và text "Đang tải bài viết..."

#### Error
- Hiển thị icon cảnh báo ⚠️
- Message lỗi
- Nút "Thử lại" để tải lại

#### Empty
- Hiển thị icon 📝
- Text "Chưa có bài viết nào"
- Subtitle phù hợp với filter đang chọn

## Navigation

### Routing
Route được thêm vào `src/constants/routing.ts`:
```typescript
FORUM: "Forum"
```

### Navigation Setup
Màn hình được đăng ký trong `src/navigations/index.tsx`:
```tsx
<Stack.Screen name={ROUTING.FORUM} component={ForumScreen} options={{ headerShown: false }} />
```

### Từ Landing Screen
Card "Diễn đàn" trong `FunctionGrid.tsx` navigate đến:
```typescript
routing: ROUTING.FORUM
```

## Styling

### Theme Colors
Sử dụng colors từ `src/theme/colors.ts`:
- **Primary**: `colors.primary[600]` - cho BLOG chip và buttons
- **Secondary**: `colors.secondary[600]` - cho NEW chip
- **Gray**: `colors.gray[...]` - cho text và backgrounds
- **White**: `colors.white` - cho card backgrounds

### Responsive Design
- Sử dụng `Dimensions.get('window')` cho responsive layout
- Card có margin và padding phù hợp
- Shadow/elevation cho depth

## Cách sử dụng

### 1. Cài đặt dependencies
```bash
npm install @react-navigation/native
npm install react-native-safe-area-context
```

### 2. Import và sử dụng
```tsx
import { ForumScreen } from './screens';
// Hoặc
import ForumScreen from './screens/ForumScreen';
```

### 3. Navigate đến Forum
```typescript
navigation.navigate(ROUTING.FORUM);
```

## Mở rộng trong tương lai

### Post Detail Screen
Hiện tại `handlePostPress` chỉ log post_id. Có thể mở rộng:
```typescript
const handlePostPress = (post: Post) => {
    navigation.navigate('PostDetail', { postId: post.post_id });
};
```

### Search
Thêm thanh tìm kiếm để filter bài viết theo tiêu đề/nội dung

### Sorting
Thêm tùy chọn sắp xếp theo:
- Mới nhất
- Cũ nhất
- Phổ biến nhất

### Create Post
Thêm nút FAB (Floating Action Button) để tạo bài viết mới

## File Structure
```
src/
├── screens/
│   └── ForumScreen.tsx          # Main screen
├── components/
│   └── ui/
│       └── Forum/
│           ├── PostItem.tsx              # Post card component
│           └── CategoryFilterChips.tsx   # Filter chips
├── types/
│   └── communication.ts         # Post & PostCategory types
├── services/
│   └── post.service.ts         # API service
├── constants/
│   └── routing.ts              # FORUM route
└── navigations/
    └── index.tsx               # Navigation setup
```

## Notes
- Component được tối ưu với React hooks (useState, useEffect, useCallback)
- Xử lý lỗi đầy đủ với try-catch
- Type-safe với TypeScript
- Responsive và có thể tái sử dụng
- Follow React Native best practices
