import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { opacity, size, spacing } from '@/theme/spacing';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { Avatar } from './Avatar';
import type { Profile } from './profileStorage';
import { displayName } from './profileText';

type ProfileCardProps = {
  profile: Profile;
  onEdit: () => void;
};

/** The top of the Profile tab: the photo, the name, and Edit Profile. */
export function ProfileCard({ profile, onEdit }: ProfileCardProps) {
  const { t } = useTranslation();
  return (
    <Card style={styles.card}>
      <View style={styles.identity}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('profile.changeProfilePhoto')}
          onPress={onEdit}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Avatar name={profile.name} photoUri={profile.photoUri} size={size.avatar} />
        </Pressable>
        <AppText variant="headline" numberOfLines={1} style={styles.name}>
          {displayName(t, profile.name)}
        </AppText>
      </View>
      <Button variant="bordered" icon="edit" label={t('profile.editProfile')} onPress={onEdit} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  name: {
    flex: 1,
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
