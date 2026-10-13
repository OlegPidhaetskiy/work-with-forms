import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { sendData } from './services/sendDate';

export default function App() {
  const today = new Date();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      userName: '',
      email: '',
      roomType: 'Standard',
      checkInDate: today,
      checkOutDate: null,
    },
  });

  const checkInDate = watch('checkInDate');
  const checkOutDate = watch('checkOutDate');

  const [activePicker, setActivePicker] = useState(null);

  const onSubmit = (data) => {
    const formattedData = {
      ...data,
      roomType: data.roomType ? data.roomType.toLowerCase() : 'standard',
    };
    sendData(formattedData);
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.formHeader}>Booking form</Text>

        {/* Name */}
        <Text style={styles.formTitle}>Name</Text>
        <Controller
          control={control}
          name="userName"
          rules={{
            required: 'Name is required',
            pattern: {
              value: /^[A-Z][a-zA-Z]{2,}$/,
              message:
                'Name must start with a capital letter and contain at least 3 characters',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              testID="user-name-input"
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Enter your name"
            />
          )}
        />
        {errors.userName?.type === 'required' && (
          <Text style={styles.errorText}>Name is required</Text>
        )}
        {errors.userName?.type === 'pattern' && (
          <Text style={styles.errorText}>
            Name must start with a capital letter and contain at least 3 characters
          </Text>
        )}

        {/* Email */}
        <Text style={styles.formTitle}>email</Text>
        <Controller
          control={control}
          name="email"
          rules={{
            required: 'e-mail is required',
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: 'Invalid email address. Please enter a valid email',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              testID="email-input"
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Enter your email"
              autoCapitalize="none"
            />
          )}
        />
        {errors.email?.type === 'required' && (
          <Text style={styles.errorText}>e-mail is required</Text>
        )}
        {errors.email?.type === 'pattern' && (
          <Text style={styles.errorText}>
            Invalid email address. Please enter a valid email
          </Text>
        )}

        {/* Check-In Date */}
        <Text style={styles.formTitle}>Check-In Date</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setActivePicker('checkIn')}
        >
          <Text>
            {checkInDate ? checkInDate.toLocaleDateString() : 'Select Date'}
          </Text>
        </TouchableOpacity>

        {/* Check-Out Date */}
        <Text style={styles.formTitle}>Check-Out Date</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setActivePicker('checkOut')}
        >
          <Text>
            {checkOutDate ? checkOutDate.toLocaleDateString() : 'Select Date'}
          </Text>
        </TouchableOpacity>

        {activePicker && (
          <DateTimePicker
            testID="date-time-picker"
            value={
              activePicker === 'checkIn'
                ? checkInDate || today
                : checkOutDate || today
            }
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              if (Platform.OS !== 'ios') {
                setActivePicker(null);
              }
              if (selectedDate) {
                if (activePicker === 'checkIn') {
                  setValue('checkInDate', selectedDate, { shouldValidate: true });
                  trigger('checkOutDate');
                } else if (activePicker === 'checkOut') {
                  setValue('checkOutDate', selectedDate, { shouldValidate: true });
                }
              }
            }}
          />
        )}

        <Controller
          control={control}
          name="checkOutDate"
          rules={{
            required: 'Check-Out Date is required',
            validate: (value) =>
              !value ||
              (checkInDate && value > checkInDate) ||
              'The Check-Out Date must be later than the Check-In Date',
          }}
          render={() => <View />}
        />
        {errors.checkOutDate?.type === 'required' && (
          <Text style={styles.errorText}>Check-Out Date is required</Text>
        )}
        {errors.checkOutDate?.type === 'validate' && (
          <Text style={styles.errorText}>
            The Check-Out Date must be later than the Check-In Date
          </Text>
        )}

        {/* Room Type Picker */}
        <Text style={styles.formTitle}>Choose the room type:</Text>
        <Controller
          control={control}
          name="roomType"
          render={({ field: { onChange, value } }) => (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={value}
                onValueChange={(itemValue) => onChange(itemValue)}
              >
                <Picker.Item label="Standard" value="Standard" />
                <Picker.Item label="Luxury" value="Luxury" />
                <Picker.Item label="Family" value="Family" />
              </Picker>
            </View>
          )}
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={{ ...styles.button, marginTop: 50 }}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 600,
  },
  button: {
    backgroundColor: '#0056b3',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  formHeader: {
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#0056b3',
    marginBottom: 20,
    marginTop: 20,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0056b3',
    marginBottom: 10,
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 10,
    borderRadius: 4,
    justifyContent: 'center',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 4,
  },
  errorText: {
    color: 'red',
    marginTop: 5,
  },
});