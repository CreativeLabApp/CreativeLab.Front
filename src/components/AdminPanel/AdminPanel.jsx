import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { masterclassApi } from "../../api/masterclassApi";
import { productApi } from "../../api/productApi";
import { userApi } from "../../api/userApi";
import {
  ShieldCheckIcon,
  VideoCameraIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  UserIcon,
  EyeIcon,
  TrashIcon,
  PencilIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  StarIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import styles from "./AdminPanel.module.css";

function AdminPanel() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuthStore();
  const [masterClasses, setMasterClasses] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    userApi
      .getAll()
      .then((data) => {
        setAllUsers(
          data
            .filter((u) => !u.isAdmin)
            .map((u) => ({
              id: u.id,
              name: `${u.name} ${u.surname}`.trim(),
              email: u.email,
              role: u.isAdmin ? "admin" : "user",
              isActive: u.isActive,
              registrationDate: u.createdAt?.split("T")[0] || "",
              masterclassesCount: u.masterclassesCount,
              productsCount: u.productsCount,
            })),
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    masterclassApi
      .getAll(false)
      .then((data) => {
        const mapped = data.masterclasses.map((m) => ({
          id: m.id,
          title: m.title,
          author: m.authorName || m.authorId,
          description: m.shortDescription || m.description || "",
          category: m.categoryName || m.categoryId,
          rating: Number(m.rating) || 0,
          views: m.views || 0,
          isPublished: m.isPublished,
          createdAt: m.createdAt,
        }));
        setMasterClasses(mapped);
      })
      .catch(() => {});
  }, []);

  const deleteMasterClass = async (id) => {
    await masterclassApi.delete(id);
    setMasterClasses((prev) => prev.filter((m) => m.id !== id));
  };

  useEffect(() => {
    productApi
      .getAll(false)
      .then((data) => setProducts(data))
      .catch(() => {});
  }, []);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedMasterClasses, setSelectedMasterClasses] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedComments, setSelectedComments] = useState([]);
  const [toggleActiveTarget, setToggleActiveTarget] = useState(null); // { id, isActive, name }
  const [deleteUserTarget, setDeleteUserTarget] = useState(null); // { id, name }
  const [deleteMasterClassTarget, setDeleteMasterClassTarget] = useState(null); // { id, title }
  const [deleteProductTarget, setDeleteProductTarget] = useState(null); // { id, title }

  // Фильтры
  const [userFilter, setUserFilter] = useState("all");
  const [masterClassFilter, setMasterClassFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [commentFilter, setCommentFilter] = useState("all"); // Новый фильтр для комментариев

  // Сортировка
  const [userSort, setUserSort] = useState({ field: "id", direction: "asc" });
  const [masterClassSort] = useState({
    field: "id",
    direction: "asc",
  });
  const [productSort, setProductSort] = useState({
    field: "id",
    direction: "asc",
  });

  // Проверка прав администратора
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!isAdmin()) {
      navigate("/");
    }
  }, [user, isAdmin, navigate]);

  // Получение всех комментариев с информацией о мастер-классе
  const getAllComments = () => {
    // Комментарии будут загружаться через API когда появится эндпоинт
    return [];
  };

  const allComments = getAllComments();

  // Фильтрация пользователей
  const filteredUsers = allUsers
    .filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.bio &&
          user.bio.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFilter =
        userFilter === "all" ||
        (userFilter === "admin" && user.role === "admin") ||
        (userFilter === "creator" && user.role === "creator") ||
        (userFilter === "user" && user.role === "user");

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const direction = userSort.direction === "asc" ? 1 : -1;
      if (userSort.field === "name") {
        return direction * a.name.localeCompare(b.name);
      }
      if (userSort.field === "id") {
        return direction * (a.id - b.id);
      }
      if (userSort.field === "rating") {
        return direction * ((a.rating || 0) - (b.rating || 0));
      }
      return 0;
    });

  // Фильтрация мастер-классов
  const filteredMasterClasses = masterClasses
    .filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        masterClassFilter === "all" ||
        (masterClassFilter === "popular" && item.views > 100) ||
        (masterClassFilter === "highRated" && item.rating >= 4.5);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const direction = masterClassSort.direction === "asc" ? 1 : -1;
      if (masterClassSort.field === "title") {
        return direction * a.title.localeCompare(b.title);
      }
      if (masterClassSort.field === "views") {
        return direction * (a.views - b.views);
      }
      if (masterClassSort.field === "rating") {
        return direction * (a.rating - b.rating);
      }
      return 0;
    });

  // Фильтрация товаров
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.seller.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        productFilter === "all" ||
        (productFilter === "available" && product.isAvailable) ||
        (productFilter === "unavailable" && !product.isAvailable);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const direction = productSort.direction === "asc" ? 1 : -1;
      if (productSort.field === "title") {
        return direction * a.title.localeCompare(b.title);
      }
      if (productSort.field === "price") {
        return direction * (a.price - b.price);
      }
      if (productSort.field === "views") {
        return direction * (a.views - b.views);
      }
      return 0;
    });

  // Фильтрация комментариев
  const filteredComments = allComments
    .filter((comment) => {
      const matchesSearch =
        comment.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.masterClassTitle
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesFilter =
        commentFilter === "all" ||
        (commentFilter === "pending" && comment.status === "pending") ||
        (commentFilter === "approved" && comment.status === "approved") ||
        (commentFilter === "rejected" && comment.status === "rejected") ||
        (commentFilter === "reported" && comment.reported);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => b.timestamp - a.timestamp); // Сортировка по дате (новые сначала)

  // Обработчики пользователей
  const handleDeleteUser = async (userId, name) => {
    setDeleteUserTarget({ id: userId, name });
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserTarget) return;
    try {
      await userApi.delete(deleteUserTarget.id);
      setAllUsers((prev) => prev.filter((u) => u.id !== deleteUserTarget.id));
      setSelectedUsers(
        selectedUsers.filter((id) => id !== deleteUserTarget.id),
      );
    } catch {
      alert("Ошибка при удалении пользователя");
    } finally {
      setDeleteUserTarget(null);
    }
  };

  const handleToggleUserActive = async (userId, currentStatus, name) => {
    setToggleActiveTarget({ id: userId, isActive: currentStatus, name });
  };

  const confirmToggleActive = async () => {
    if (!toggleActiveTarget) return;
    try {
      const { isActive } = await userApi.toggleActive(toggleActiveTarget.id);
      setAllUsers((prev) =>
        prev.map((u) =>
          u.id === toggleActiveTarget.id ? { ...u, isActive } : u,
        ),
      );
    } catch {
      alert("Ошибка при изменении статуса пользователя");
    } finally {
      setToggleActiveTarget(null);
    }
  };

  // Обработчики мастер-классов
  const handleDeleteMasterClass = (id, title) => {
    setDeleteMasterClassTarget({ id, title });
  };

  const confirmDeleteMasterClass = async () => {
    if (!deleteMasterClassTarget) return;
    try {
      await deleteMasterClass(deleteMasterClassTarget.id);
      setSelectedMasterClasses(
        selectedMasterClasses.filter(
          (masterClassId) => masterClassId !== deleteMasterClassTarget.id,
        ),
      );
    } catch {
      alert("Ошибка при удалении мастер-класса");
    } finally {
      setDeleteMasterClassTarget(null);
    }
  };

  // Обработчики товаров
  const handleDeleteProduct = (id, title) => {
    setDeleteProductTarget({ id, title });
  };

  const confirmDeleteProduct = async () => {
    if (!deleteProductTarget) return;
    try {
      await productApi.delete(deleteProductTarget.id);
      setProducts((prev) =>
        prev.filter((p) => p.id !== deleteProductTarget.id),
      );
      setSelectedProducts(
        selectedProducts.filter((id) => id !== deleteProductTarget.id),
      );
    } catch {
      alert("Ошибка при удалении товара");
    } finally {
      setDeleteProductTarget(null);
    }
  };

  const handleUpdateProductStatus = async (id, isAvailable) => {
    try {
      const product = products.find((p) => p.id === id);
      if (!product) return;
      await productApi.update({ ...product, isAvailable });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                isAvailable,
                status: isAvailable ? "available" : "unavailable",
              }
            : p,
        ),
      );
    } catch {
      alert("Ошибка при изменении статуса товара");
    }
  };

  // Обработчики комментариев
  const handleApproveComment = (commentId) => {
    if (window.confirm("Одобрить этот комментарий?")) {
      setSelectedComments(selectedComments.filter((id) => id !== commentId));
    }
  };

  const handleRejectComment = (commentId) => {
    if (window.confirm("Отклонить этот комментарий?")) {
      setSelectedComments(selectedComments.filter((id) => id !== commentId));
    }
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm("Удалить этот комментарий?")) {
      setSelectedComments(selectedComments.filter((id) => id !== commentId));
    }
  };

  const handleBulkApproveComments = () => {
    if (window.confirm(`Одобрить ${selectedComments.length} комментариев?`)) {
      setSelectedComments([]);
    }
  };

  const handleBulkRejectComments = () => {
    if (window.confirm(`Отклонить ${selectedComments.length} комментариев?`)) {
      setSelectedComments([]);
    }
  };

  const handleBulkDeleteComments = () => {
    if (window.confirm(`Удалить ${selectedComments.length} комментариев?`)) {
      setSelectedComments([]);
    }
  };

  // Массовые операции
  const handleBulkDeleteUsers = async () => {
    if (window.confirm(`Удалить ${selectedUsers.length} пользователей?`)) {
      await Promise.all(
        selectedUsers.map((id) => userApi.delete(id).catch(() => {})),
      );
      setAllUsers((prev) => prev.filter((u) => !selectedUsers.includes(u.id)));
      setSelectedUsers([]);
    }
  };

  const handleBulkDeleteMasterClasses = async () => {
    if (
      window.confirm(`Удалить ${selectedMasterClasses.length} мастер-классов?`)
    ) {
      try {
        await Promise.all(
          selectedMasterClasses.map((id) =>
            deleteMasterClass(id).catch(() => {}),
          ),
        );
        setSelectedMasterClasses([]);
      } catch {
        alert("Ошибка при массовом удалении мастер-классов");
      }
    }
  };

  const handleBulkDeleteProducts = async () => {
    if (window.confirm(`Удалить ${selectedProducts.length} товаров?`)) {
      await Promise.all(
        selectedProducts.map((id) => productApi.delete(id).catch(() => {})),
      );
      setProducts((prev) =>
        prev.filter((p) => !selectedProducts.includes(p.id)),
      );
      setSelectedProducts([]);
    }
  };

  // Панель управления
  const renderDashboard = () => (
    <div className={styles.dashboard}>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <UserGroupIcon className={styles.statIcon} />
            <h3>Пользователи</h3>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{allUsers.length}</div>
            <div className={styles.statBreakdown}>
              <span>
                {allUsers.filter((u) => u.role === "admin").length}{" "}
                администраторов
              </span>
              <span>
                {allUsers.filter((u) => u.role === "user").length} обычных
              </span>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <VideoCameraIcon className={styles.statIcon} />
            <h3>Мастер-классы</h3>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{masterClasses.length}</div>
            <div className={styles.statBreakdown}>
              <span>
                {masterClasses.filter((m) => m.isPublished).length} опубликовано
              </span>
              <span>
                {masterClasses.reduce((sum, m) => sum + (m.views || 0), 0)}{" "}
                просмотров
              </span>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <ShoppingBagIcon className={styles.statIcon} />
            <h3>Товары</h3>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{products.length}</div>
            <div className={styles.statBreakdown}>
              <span>
                {products.filter((p) => p.isAvailable).length} в наличии
              </span>
              <span>
                {products.filter((p) => !p.isAvailable).length} нет в наличии
              </span>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <ChartBarIcon className={styles.statIcon} />
            <h3>Средний рейтинг</h3>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>
              {masterClasses.length
                ? (
                    masterClasses.reduce((s, m) => s + (m.rating || 0), 0) /
                    masterClasses.length
                  ).toFixed(1)
                : "—"}
            </div>
            <div className={styles.statBreakdown}>
              <span>
                {masterClasses.filter((m) => m.rating >= 4.5).length} с
                рейтингом 4.5+
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Топ мастер-классов */}
      {masterClasses.length > 0 && (
        <div className={styles.dashboardSection}>
          <h3 className={styles.dashboardSectionTitle}>
            Топ мастер-классов по просмотрам
          </h3>
          <div className={styles.topList}>
            {[...masterClasses]
              .sort((a, b) => (b.views || 0) - (a.views || 0))
              .slice(0, 5)
              .map((m, i) => (
                <div key={m.id} className={styles.topItem}>
                  <span className={styles.topRank}>#{i + 1}</span>
                  <span className={styles.topTitle}>{m.title}</span>
                  <span className={styles.topMeta}>{m.views || 0} просм.</span>
                  <span className={styles.topMeta}>★ {m.rating || 0}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Последние пользователи */}
      {allUsers.length > 0 && (
        <div className={styles.dashboardSection}>
          <h3 className={styles.dashboardSectionTitle}>
            Последние зарегистрированные
          </h3>
          <div className={styles.topList}>
            {[...allUsers]
              .sort(
                (a, b) =>
                  new Date(b.registrationDate) - new Date(a.registrationDate),
              )
              .slice(0, 5)
              .map((u) => (
                <div key={u.id} className={styles.topItem}>
                  <span className={styles.topTitle}>{u.name}</span>
                  <span className={styles.topMeta}>{u.email}</span>
                  <span className={styles.topMeta}>{u.registrationDate}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );

  // Управление пользователями
  const renderUsersManagement = () => (
    <div className={styles.managementSection}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>
          Управление пользователями ({allUsers.length})
        </h3>
        <div className={styles.sectionControls}>
          <div className={styles.searchBox}>
            <MagnifyingGlassIcon className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Поиск пользователей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Все пользователи</option>
            <option value="admin">Администраторы</option>
            <option value="user">Обычные пользователи</option>
          </select>
          {selectedUsers.length > 0 && (
            <button
              className={styles.bulkDeleteButton}
              onClick={handleBulkDeleteUsers}
            >
              <TrashIcon className={styles.actionIcon} />
              Удалить выбранные ({selectedUsers.length})
            </button>
          )}
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.managementTable}>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers(filteredUsers.map((u) => u.id));
                    } else {
                      setSelectedUsers([]);
                    }
                  }}
                  checked={
                    selectedUsers.length === filteredUsers.length &&
                    filteredUsers.length > 0
                  }
                />
              </th>
              <th>
                <button
                  className={styles.sortButton}
                  onClick={() =>
                    setUserSort({
                      field: "id",
                      direction:
                        userSort.field === "id" && userSort.direction === "asc"
                          ? "desc"
                          : "asc",
                    })
                  }
                >
                  ID{" "}
                  {userSort.field === "id" &&
                    (userSort.direction === "asc" ? "↑" : "↓")}
                </button>
              </th>
              <th>Пользователь</th>
              <th>Роль</th>
              <th>
                <button
                  className={styles.sortButton}
                  onClick={() =>
                    setUserSort({
                      field: "rating",
                      direction:
                        userSort.field === "rating" &&
                        userSort.direction === "asc"
                          ? "desc"
                          : "asc",
                    })
                  }
                >
                  Рейтинг{" "}
                  {userSort.field === "rating" &&
                    (userSort.direction === "asc" ? "↑" : "↓")}
                </button>
              </th>
              <th>Дата регистрации</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((userItem) => (
              <tr
                key={userItem.id}
                className={
                  selectedUsers.includes(userItem.id) ? styles.selectedRow : ""
                }
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(userItem.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers([...selectedUsers, userItem.id]);
                      } else {
                        setSelectedUsers(
                          selectedUsers.filter((id) => id !== userItem.id),
                        );
                      }
                    }}
                  />
                </td>
                <td>{userItem.id}</td>
                <td>
                  <div className={styles.userCell}>
                    <div className={styles.userAvatar}>
                      {userItem.avatar ? (
                        <img src={userItem.avatar} alt={userItem.name} />
                      ) : (
                        <UserIcon className={styles.avatarPlaceholder} />
                      )}
                    </div>
                    <div className={styles.userInfo}>
                      <div className={styles.userName}>{userItem.name}</div>
                      <div className={styles.userEmail}>
                        {userItem.email || "Нет email"}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    className={`${styles.roleBadge} ${styles[userItem.role]}`}
                  >
                    {userItem.role === "admin"
                      ? "Администратор"
                      : "Пользователь"}
                  </span>
                </td>
                <td>
                  <div className={styles.ratingCell}>
                    <StarIcon className={styles.ratingIcon} />
                    {userItem.rating ? userItem.rating.toFixed(1) : "Нет"}
                  </div>
                </td>
                <td>{userItem.registrationDate}</td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${
                      userItem.isActive ? styles.active : styles.inactive
                    }`}
                  >
                    {userItem.isActive ? "Активен" : "Неактивен"}
                  </span>
                </td>
                <td>
                  <div className={styles.actionButtons}>
                    <button
                      onClick={() => navigate(`/creator/${userItem.id}`)}
                      className={styles.viewButton}
                      title="Просмотреть профиль"
                    >
                      <EyeIcon className={styles.buttonIcon} />
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/admin/edit-user/${userItem.id}`)
                      }
                      className={styles.editButton}
                      title="Редактировать профиль"
                    >
                      <PencilIcon className={styles.buttonIcon} />
                    </button>
                    <button
                      onClick={() =>
                        handleToggleUserActive(
                          userItem.id,
                          userItem.isActive,
                          userItem.name,
                        )
                      }
                      className={
                        userItem.isActive
                          ? styles.deactivateButton
                          : styles.activateButton
                      }
                      title={
                        userItem.isActive ? "Деактивировать" : "Активировать"
                      }
                    >
                      {userItem.isActive ? "Деакт." : "Акт."}
                    </button>
                    {userItem.id !== user.id && (
                      <button
                        onClick={() =>
                          handleDeleteUser(userItem.id, userItem.name)
                        }
                        className={styles.deleteButton}
                        title="Удалить"
                      >
                        <TrashIcon className={styles.buttonIcon} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Управление мастер-классами
  const renderMasterClassesManagement = () => (
    <div className={styles.managementSection}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>
          Управление мастер-классами ({masterClasses.length})
        </h3>
        <div className={styles.sectionControls}>
          <div className={styles.searchBox}>
            <MagnifyingGlassIcon className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Поиск мастер-классов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <select
            value={masterClassFilter}
            onChange={(e) => setMasterClassFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Все мастер-классы</option>
            <option value="popular">Популярные (100+ просмотров)</option>
            <option value="highRated">Высокий рейтинг (4.5+)</option>
          </select>
          {selectedMasterClasses.length > 0 && (
            <button
              className={styles.bulkDeleteButton}
              onClick={handleBulkDeleteMasterClasses}
            >
              <TrashIcon className={styles.actionIcon} />
              Удалить выбранные ({selectedMasterClasses.length})
            </button>
          )}
        </div>
      </div>

      <div className={styles.cardsGrid}>
        {filteredMasterClasses.map((item) => (
          <div key={item.id} className={styles.objectCard}>
            <div className={styles.cardCheckbox}>
              <input
                type="checkbox"
                checked={selectedMasterClasses.includes(item.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedMasterClasses([
                      ...selectedMasterClasses,
                      item.id,
                    ]);
                  } else {
                    setSelectedMasterClasses(
                      selectedMasterClasses.filter((id) => id !== item.id),
                    );
                  }
                }}
              />
            </div>

            <div className={styles.cardHeader}>
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  className={styles.cardImage}
                />
              )}
              <div className={styles.cardTitle}>{item.title}</div>
              <div className={styles.cardAuthor}>Автор: {item.author}</div>
            </div>

            <div className={styles.cardContent}>
              <div className={styles.cardStats}>
                <div className={styles.statItem}>
                  <EyeIcon className={styles.statIcon} />
                  <span>{item.views} просмотров</span>
                </div>
                <div className={styles.statItem}>
                  <StarIcon className={styles.statIcon} />
                  <span>{item.rating} ★</span>
                </div>
                <div className={styles.statItem}>
                  <CalendarIcon className={styles.statIcon} />
                  <span>{item.createdAt}</span>
                </div>
              </div>
              <div className={styles.cardDescription}>
                {item.description?.substring(0, 100)}...
              </div>
              <div className={styles.cardTags}>
                {item.tags?.slice(0, 3).map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.cardActions}>
              <button
                onClick={() => navigate(`/master-class/${item.id}`)}
                className={styles.viewButton}
              >
                <EyeIcon className={styles.buttonIcon} />
                Просмотреть
              </button>
              <button
                onClick={() => handleDeleteMasterClass(item.id, item.title)}
                className={styles.deleteButton}
              >
                <TrashIcon className={styles.buttonIcon} />
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Управление товарами
  const renderProductsManagement = () => (
    <div className={styles.managementSection}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>
          Управление товарами ({products.length})
        </h3>
        <div className={styles.sectionControls}>
          <div className={styles.searchBox}>
            <MagnifyingGlassIcon className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Поиск товаров..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Все товары</option>
            <option value="available">Доступные</option>
            <option value="unavailable">Недоступные</option>
          </select>
          {selectedProducts.length > 0 && (
            <button
              className={styles.bulkDeleteButton}
              onClick={handleBulkDeleteProducts}
            >
              <TrashIcon className={styles.actionIcon} />
              Удалить выбранные ({selectedProducts.length})
            </button>
          )}
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.managementTable}>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProducts(filteredProducts.map((p) => p.id));
                    } else {
                      setSelectedProducts([]);
                    }
                  }}
                  checked={
                    selectedProducts.length === filteredProducts.length &&
                    filteredProducts.length > 0
                  }
                />
              </th>
              <th>ID</th>
              <th>Товар</th>
              <th>Продавец</th>
              <th>
                <button
                  className={styles.sortButton}
                  onClick={() =>
                    setProductSort({
                      field: "price",
                      direction:
                        productSort.field === "price" &&
                        productSort.direction === "asc"
                          ? "desc"
                          : "asc",
                    })
                  }
                >
                  Цена{" "}
                  {productSort.field === "price" &&
                    (productSort.direction === "asc" ? "↑" : "↓")}
                </button>
              </th>
              <th>Просмотры</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr
                key={product.id}
                className={
                  selectedProducts.includes(product.id)
                    ? styles.selectedRow
                    : ""
                }
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts([...selectedProducts, product.id]);
                      } else {
                        setSelectedProducts(
                          selectedProducts.filter((id) => id !== product.id),
                        );
                      }
                    }}
                  />
                </td>
                <td>{product.id}</td>
                <td>
                  <div className={styles.productCell}>
                    {product.images?.[0] && (
                      <img
                        src={product.images[0]}
                        alt=""
                        className={styles.productImage}
                      />
                    )}
                    <div className={styles.productInfo}>
                      <div className={styles.productTitle}>{product.title}</div>
                      <div className={styles.productCategory}>
                        {product.category}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.sellerInfo}>
                    <div className={styles.sellerName}>{product.seller}</div>
                    <div className={styles.sellerId}>
                      ID: {product.sellerId}
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.priceCell}>
                    <CurrencyDollarIcon className={styles.priceIcon} />
                    {product.price} Br
                  </div>
                </td>
                <td>{product.views}</td>
                <td>
                  <select
                    value={product.isAvailable ? "available" : "unavailable"}
                    onChange={(e) =>
                      handleUpdateProductStatus(
                        product.id,
                        e.target.value === "available",
                      )
                    }
                    className={styles.statusSelect}
                  >
                    <option value="available">Доступен</option>
                    <option value="unavailable">Недоступен</option>
                  </select>
                </td>
                <td>
                  <div className={styles.actionButtons}>
                    <button
                      onClick={() =>
                        navigate(`/marketplace/product/${product.id}`)
                      }
                      className={styles.viewButton}
                      title="Просмотреть"
                    >
                      <EyeIcon className={styles.buttonIcon} />
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteProduct(product.id, product.title)
                      }
                      className={styles.deleteButton}
                      title="Удалить"
                    >
                      <TrashIcon className={styles.buttonIcon} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Модерация комментариев
  const renderCommentsModeration = () => (
    <div className={styles.managementSection}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>
          <ChatBubbleLeftIcon className={styles.sectionIcon} />
          Модерация комментариев ({allComments.length})
        </h3>
        <div className={styles.sectionControls}>
          <div className={styles.searchBox}>
            <MagnifyingGlassIcon className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Поиск комментариев..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <select
            value={commentFilter}
            onChange={(e) => setCommentFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Все комментарии</option>
            <option value="pending">На модерации</option>
            <option value="approved">Одобренные</option>
            <option value="rejected">Отклоненные</option>
            <option value="reported">Жалобы</option>
          </select>
          {selectedComments.length > 0 && (
            <div className={styles.bulkActions}>
              <button
                className={styles.bulkApproveButton}
                onClick={handleBulkApproveComments}
              >
                <CheckCircleIcon className={styles.actionIcon} />
                Одобрить ({selectedComments.length})
              </button>
              <button
                className={styles.bulkRejectButton}
                onClick={handleBulkRejectComments}
              >
                <XCircleIcon className={styles.actionIcon} />
                Отклонить ({selectedComments.length})
              </button>
              <button
                className={styles.bulkDeleteButton}
                onClick={handleBulkDeleteComments}
              >
                <TrashIcon className={styles.actionIcon} />
                Удалить ({selectedComments.length})
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.commentsContainer}>
        {filteredComments.length === 0 ? (
          <div className={styles.noComments}>
            <ChatBubbleLeftIcon className={styles.noCommentsIcon} />
            <p>Комментарии не найдены</p>
          </div>
        ) : (
          filteredComments.map((comment) => (
            <div
              key={comment.id}
              className={`${styles.commentCard} ${
                selectedComments.includes(comment.id)
                  ? styles.selectedComment
                  : ""
              } ${comment.reported ? styles.reportedComment : ""}`}
            >
              <div className={styles.commentCheckbox}>
                <input
                  type="checkbox"
                  checked={selectedComments.includes(comment.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedComments([...selectedComments, comment.id]);
                    } else {
                      setSelectedComments(
                        selectedComments.filter((id) => id !== comment.id),
                      );
                    }
                  }}
                />
              </div>

              <div className={styles.commentHeader}>
                <div className={styles.commentUser}>
                  <div className={styles.userAvatarSmall}>
                    {comment.userAvatar ? (
                      <img src={comment.userAvatar} alt={comment.userName} />
                    ) : (
                      <UserIcon className={styles.avatarPlaceholder} />
                    )}
                  </div>
                  <div className={styles.userInfo}>
                    <div className={styles.userName}>{comment.userName}</div>
                    <div className={styles.userId}>ID: {comment.userId}</div>
                  </div>
                </div>
                <div className={styles.commentMeta}>
                  <div className={styles.commentDate}>
                    <CalendarIcon className={styles.metaIcon} />
                    {new Date(comment.timestamp).toLocaleDateString()}
                  </div>
                  <div className={styles.commentRating}>
                    <StarIcon className={styles.metaIcon} />
                    {comment.rating} ★
                  </div>
                  <span
                    className={`${styles.statusBadge} ${
                      comment.status === "approved"
                        ? styles.approved
                        : comment.status === "rejected"
                          ? styles.rejected
                          : styles.pending
                    }`}
                  >
                    {comment.status === "approved"
                      ? "Одобрен"
                      : comment.status === "rejected"
                        ? "Отклонен"
                        : "На модерации"}
                  </span>
                </div>
              </div>

              <div className={styles.commentMasterClass}>
                <strong>Мастер-класс:</strong>
                <a
                  href={`/masterclass/${comment.masterClassId}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/masterclass/${comment.masterClassId}`);
                  }}
                  className={styles.masterClassLink}
                >
                  {comment.masterClassTitle}
                </a>
                <span className={styles.masterClassAuthor}>
                  Автор: {comment.masterClassAuthor}
                </span>
              </div>

              <div className={styles.commentContent}>
                <p>{comment.comment}</p>
                {comment.reported && comment.reportReason && (
                  <div className={styles.reportInfo}>
                    <ExclamationTriangleIcon className={styles.reportIcon} />
                    <strong>Жалоба:</strong> {comment.reportReason}
                  </div>
                )}
              </div>

              <div className={styles.commentActions}>
                <button
                  onClick={() => navigate(`/creator/${comment.userId}`)}
                  className={styles.viewProfileButton}
                >
                  <UserIcon className={styles.buttonIcon} />
                  Профиль
                </button>
                <button
                  onClick={() =>
                    navigate(`/masterclass/${comment.masterClassId}`)
                  }
                  className={styles.viewMasterClassButton}
                >
                  <EyeIcon className={styles.buttonIcon} />
                  Мастер-класс
                </button>
                {comment.status !== "approved" && (
                  <button
                    onClick={() => handleApproveComment(comment.id)}
                    className={styles.approveButton}
                  >
                    <CheckCircleIcon className={styles.buttonIcon} />
                    Одобрить
                  </button>
                )}
                {comment.status !== "rejected" && (
                  <button
                    onClick={() => handleRejectComment(comment.id)}
                    className={styles.rejectButton}
                  >
                    <XCircleIcon className={styles.buttonIcon} />
                    Отклонить
                  </button>
                )}
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className={styles.deleteButton}
                >
                  <TrashIcon className={styles.buttonIcon} />
                  Удалить
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  if (!user || !isAdmin()) {
    return null;
  }

  return (
    <div className={styles.adminPanel}>
      {/* Модалка удаления товара */}
      {deleteProductTarget && (
        <div
          className={styles.modalOverlay}
          onClick={() => setDeleteProductTarget(null)}
        >
          <div
            className={styles.confirmModal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.confirmTitle}>Удалить товар?</h3>
            <p className={styles.confirmText}>
              Вы действительно хотите удалить товар «{deleteProductTarget.title}
              »? Это действие нельзя отменить.
            </p>
            <div className={styles.confirmActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setDeleteProductTarget(null)}
              >
                Отмена
              </button>
              <button
                className={styles.deleteConfirmButton}
                onClick={confirmDeleteProduct}
              >
                Удалить навсегда
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Модалка удаления мастер-класса */}{" "}
      {deleteMasterClassTarget && (
        <div
          className={styles.modalOverlay}
          onClick={() => setDeleteMasterClassTarget(null)}
        >
          <div
            className={styles.confirmModal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.confirmTitle}>Удалить мастер-класс?</h3>
            <p className={styles.confirmText}>
              Вы действительно хотите удалить мастер-класс «
              {deleteMasterClassTarget.title}»? Это действие нельзя отменить.
              Будут удалены все данные мастер-класса, включая комментарии и
              оценки.
            </p>
            <div className={styles.confirmActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setDeleteMasterClassTarget(null)}
              >
                Отмена
              </button>
              <button
                className={styles.deleteConfirmButton}
                onClick={confirmDeleteMasterClass}
              >
                Удалить навсегда
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Модалка удаления пользователя */}
      {deleteUserTarget && (
        <div
          className={styles.modalOverlay}
          onClick={() => setDeleteUserTarget(null)}
        >
          <div
            className={styles.confirmModal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.confirmTitle}>Удалить пользователя?</h3>
            <p className={styles.confirmText}>
              Вы действительно хотите удалить пользователя «
              {deleteUserTarget.name}»? Это действие нельзя отменить. Будут
              удалены все данные пользователя, включая его мастер-классы, товары
              и комментарии.
            </p>
            <div className={styles.confirmActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setDeleteUserTarget(null)}
              >
                Отмена
              </button>
              <button
                className={styles.deleteConfirmButton}
                onClick={confirmDeleteUser}
              >
                Удалить навсегда
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Модалка деактивации/активации пользователя */}
      {toggleActiveTarget && (
        <div
          className={styles.modalOverlay}
          onClick={() => setToggleActiveTarget(null)}
        >
          <div
            className={styles.confirmModal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.confirmTitle}>
              {toggleActiveTarget.isActive
                ? "Деактивировать пользователя?"
                : "Активировать пользователя?"}
            </h3>
            <p className={styles.confirmText}>
              {toggleActiveTarget.isActive
                ? `Пользователь «${toggleActiveTarget.name}» не сможет войти в систему.`
                : `Пользователь «${toggleActiveTarget.name}» снова получит доступ к системе.`}
            </p>
            <div className={styles.confirmActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setToggleActiveTarget(null)}
              >
                Отмена
              </button>
              <button
                className={
                  toggleActiveTarget.isActive
                    ? styles.deactivateConfirmButton
                    : styles.activateConfirmButton
                }
                onClick={confirmToggleActive}
              >
                {toggleActiveTarget.isActive
                  ? "Деактивировать"
                  : "Активировать"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Заголовок */}
      <div className={styles.adminHeader}>
        <div className={styles.headerContent}>
          <ShieldCheckIcon className={styles.adminIcon} />
          <h1>Панель администратора</h1>
        </div>
        <div className={styles.userInfo}>
          <button onClick={() => navigate("/")} className={styles.exitButton}>
            На главную
          </button>
        </div>
      </div>
      {/* Навигация */}
      <div className={styles.adminNavigation}>
        <button
          className={`${styles.navButton} ${
            activeTab === "dashboard" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("dashboard")}
        >
          <ChartBarIcon className={styles.navIcon} />
          Панель управления
        </button>

        <button
          className={`${styles.navButton} ${
            activeTab === "users" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("users")}
        >
          <UserGroupIcon className={styles.navIcon} />
          Пользователи
          <span className={styles.navBadge}>{allUsers.length}</span>
        </button>

        <button
          className={`${styles.navButton} ${
            activeTab === "masterclasses" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("masterclasses")}
        >
          <VideoCameraIcon className={styles.navIcon} />
          Мастер-классы
          <span className={styles.navBadge}>{masterClasses.length}</span>
        </button>

        <button
          className={`${styles.navButton} ${
            activeTab === "products" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("products")}
        >
          <ShoppingBagIcon className={styles.navIcon} />
          Товары
          <span className={styles.navBadge}>{products.length}</span>
        </button>

        <button
          className={`${styles.navButton} ${
            activeTab === "comments" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("comments")}
        >
          <ChatBubbleLeftIcon className={styles.navIcon} />
          Комментарии
          <span className={styles.navBadge}>{allComments.length}</span>
        </button>
      </div>
      {/* Содержимое */}
      <div className={styles.adminContent}>
        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "users" && renderUsersManagement()}
        {activeTab === "masterclasses" && renderMasterClassesManagement()}
        {activeTab === "products" && renderProductsManagement()}
        {activeTab === "comments" && renderCommentsModeration()}
      </div>
    </div>
  );
}

export default AdminPanel;
