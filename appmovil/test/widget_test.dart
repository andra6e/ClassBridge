import 'package:flutter_test/flutter_test.dart';
import 'package:appmovil/app.dart';

void main() {
  testWidgets('La app inicia correctamente', (WidgetTester tester) async {
    await tester.pumpWidget(const ClassBridgeApp());
    await tester.pumpAndSettle();
    expect(find.textContaining('ClassBridge'), findsAny);
  });
}
