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
      unselectedLabelColor: Colors.grey,
      indicatorColor: Theme.of(context).colorScheme.primary,
      labelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
      tabs: const [
        Tab(text: 'Chat'),
        Tab(text: 'Asistencia'),
      ],
    );
  }
}
