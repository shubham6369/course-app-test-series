import 'package:flutter/material.dart';
import '../theme.dart';

/// Interactive Subject / Exam Category Grid & Chips for Home Dashboard and Course Catalog
class CategoryGrid extends StatelessWidget {
  final List<Map<String, dynamic>> categories;
  final String? selectedCategory;
  final ValueChanged<String> onCategorySelected;
  final bool isHorizontal;

  const CategoryGrid({
    super.key,
    required this.categories,
    this.selectedCategory,
    required this.onCategorySelected,
    this.isHorizontal = false,
  });

  static const List<Map<String, dynamic>> defaultCategories = [
    {'id': 'all', 'name': 'All Exams', 'icon': Icons.apps_rounded, 'color': AppColors.primary},
    {'id': 'neet', 'name': 'NEET', 'icon': Icons.medical_services_outlined, 'color': AppColors.accent},
    {'id': 'jee', 'name': 'JEE', 'icon': Icons.engineering_outlined, 'color': AppColors.primaryLight},
    {'id': 'physics', 'name': 'Physics', 'icon': Icons.bolt_outlined, 'color': AppColors.warning},
    {'id': 'chemistry', 'name': 'Chemistry', 'icon': Icons.science_outlined, 'color': AppColors.accentLight},
    {'id': 'biology', 'name': 'Biology', 'icon': Icons.biotech_outlined, 'color': AppColors.success},
    {'id': 'mathematics', 'name': 'Mathematics', 'icon': Icons.calculate_outlined, 'color': Colors.deepPurple},
    {'id': 'class_12', 'name': 'Class 12th', 'icon': Icons.menu_book_outlined, 'color': AppColors.info},
  ];

  @override
  Widget build(BuildContext context) {
    final items = categories.isNotEmpty ? categories : defaultCategories;

    if (isHorizontal) {
      return SizedBox(
        height: 48,
        child: ListView.separated(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          scrollDirection: Axis.horizontal,
          itemCount: items.length,
          separatorBuilder: (_, __) => const SizedBox(width: 8),
          itemBuilder: (context, index) {
            final cat = items[index];
            final name = cat['name']?.toString() ?? '';
            final isSelected = selectedCategory == null
                ? index == 0
                : (selectedCategory == name || selectedCategory == cat['id']?.toString());

            return FilterChip(
              selected: isSelected,
              label: Text(
                name,
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                  color: isSelected ? Colors.white : AppColors.textPrimary,
                ),
              ),
              selectedColor: AppColors.primary,
              backgroundColor: Colors.white,
              checkmarkColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: BorderSide(
                  color: isSelected ? AppColors.primary : AppColors.border,
                  width: 1,
                ),
              ),
              onSelected: (_) => onCategorySelected(name),
            );
          },
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: items.length > 8 ? 8 : items.length,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 4,
          mainAxisSpacing: 12,
          crossAxisSpacing: 10,
          childAspectRatio: 0.82,
        ),
        itemBuilder: (context, index) {
          final cat = items[index];
          final name = cat['name']?.toString() ?? 'Category';
          final iconData = (cat['icon'] is IconData)
              ? (cat['icon'] as IconData)
              : _getCategoryIcon(name);
          final color = (cat['color'] is Color)
              ? (cat['color'] as Color)
              : _getCategoryColor(index);
          final isSelected = selectedCategory == name;

          return InkWell(
            onTap: () => onCategorySelected(name),
            borderRadius: BorderRadius.circular(12),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.primary : color.withAlpha(25),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected ? AppColors.primary : color.withAlpha(60),
                      width: 1.5,
                    ),
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: AppColors.primary.withAlpha(60),
                              blurRadius: 8,
                              offset: const Offset(0, 4),
                            )
                          ]
                        : null,
                  ),
                  child: Icon(
                    iconData,
                    size: 26,
                    color: isSelected ? Colors.white : color,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  name,
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 11,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                    color: isSelected ? AppColors.primary : AppColors.textPrimary,
                    height: 1.15,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  IconData _getCategoryIcon(String name) {
    final lower = name.toLowerCase();
    if (lower.contains('neet') || lower.contains('medic')) return Icons.medical_services_outlined;
    if (lower.contains('jee') || lower.contains('iit') || lower.contains('engineer')) return Icons.engineering_outlined;
    if (lower.contains('physics')) return Icons.bolt_outlined;
    if (lower.contains('chemistry')) return Icons.science_outlined;
    if (lower.contains('biology') || lower.contains('botany') || lower.contains('zoology')) return Icons.biotech_outlined;
    if (lower.contains('math')) return Icons.calculate_outlined;
    if (lower.contains('12')) return Icons.menu_book_outlined;
    if (lower.contains('11')) return Icons.auto_stories_outlined;
    if (lower.contains('found')) return Icons.psychology_outlined;
    if (lower.contains('cuet')) return Icons.school_outlined;
    return Icons.folder_outlined;
  }

  Color _getCategoryColor(int index) {
    const palette = [
      AppColors.primary,
      AppColors.accent,
      AppColors.primaryLight,
      AppColors.warning,
      AppColors.info,
      AppColors.success,
      Colors.deepPurple,
      Colors.teal,
    ];
    return palette[index % palette.length];
  }
}
