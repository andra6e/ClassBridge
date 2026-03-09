import 'package:flutter/material.dart';

class TopTabs extends StatelessWidget implements PreferredSizeWidget {
  final TabController controlador;

  const TopTabs({super.key, required this.controlador});

  @override
  Size get preferredSize => const Size.fromHeight(48);

  @override
  Widget build(BuildContext context) {
    return TabBar(
      controller: controlador,
      labelColor: Theme.of(context).colorScheme.primary,
      unselectedLabelColor: const Color(0xFF64748B),
      indicator: BoxDecoration(
        color: const Color(0xFFEAF2FF),
        borderRadius: BorderRadius.circular(12),
      ),
      indicatorSize: TabBarIndicatorSize.tab,
      dividerColor: Colors.transparent,
      labelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
      tabs: const [
        Tab(text: 'Chat'),
        Tab(text: 'Asistencia'),
      ],
    );
  }
}
