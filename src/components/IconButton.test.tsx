import { render, screen, userEvent } from '@testing-library/react-native';
import { darkColors as colors } from '@/theme/colors';
import { border, size } from '@/theme/spacing';
import { IconButton } from './IconButton';

test('does not call onPress when disabled', async () => {
  const onPress = jest.fn();
  const user = userEvent.setup();
  await render(<IconButton icon="close" accessibilityLabel="Close" disabled onPress={onPress} />);

  const button = screen.getByRole('button', { name: 'Close' });
  await user.press(button);

  expect(onPress).not.toHaveBeenCalled();
  expect(button).toBeDisabled();
});

test('outlined: a dashed green ring around the icon, like New Workout, inside the 48 dp target', async () => {
  await render(
    <IconButton
      icon="add"
      variant="outlined"
      accessibilityLabel="New exercise"
      onPress={() => {}}
    />,
  );

  expect(screen.getByRole('button', { name: 'New exercise' })).toHaveStyle({
    width: size.iconButton,
    height: size.iconButton,
  });
  expect(screen.getByTestId('icon-button-ring')).toHaveStyle({
    width: size.iconButtonRing,
    borderRadius: size.iconButtonRing / 2,
    borderWidth: border.outline,
    borderStyle: 'dashed',
    borderColor: colors.secondaryOutline,
  });
});
