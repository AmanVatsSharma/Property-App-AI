/**
 * @file emi-calculator.tsx
 * @module app/(tabs)/more
 * @description EMI & Loan Calculator screen
 * @author BharatERP
 * @created 2025-03-10
 */

import { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';

const formatCr = (v: number) => (v >= 100 ? `₹${(v / 100).toFixed(2)} Cr` : `₹${v} L`);

function Stepper({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <View className="mb-4">
      <View className="flex-row justify-between mb-1">
        <Text className="text-text-muted text-sm">{label}</Text>
        <Text className="text-teal font-semibold">{format(value)}</Text>
      </View>
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={() => onChange(Math.max(min, value - step))}
          className="bg-dark-2 w-10 h-10 rounded-lg items-center justify-center border border-border"
        >
          <Text className="text-white text-lg">−</Text>
        </Pressable>
        <View className="flex-1 h-2 bg-dark-2 rounded-full overflow-hidden">
          <View
            className="h-full bg-teal rounded-full"
            style={{ width: `${((value - min) / (max - min)) * 100}%` }}
          />
        </View>
        <Pressable
          onPress={() => onChange(Math.min(max, value + step))}
          className="bg-dark-2 w-10 h-10 rounded-lg items-center justify-center border border-border"
        >
          <Text className="text-white text-lg">+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function EMICalculatorScreen() {
  const [price, setPrice] = useState(150);
  const [down, setDown] = useState(20);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const loanLakh = (price * (100 - down)) / 100;
  const loanRupees = loanLakh * 100000;
  const monthlyRate = rate / 12 / 100;
  const months = tenure * 12;
  const emi =
    monthlyRate > 0 && months > 0
      ? Math.round(
          (loanRupees * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
            (Math.pow(1 + monthlyRate, months) - 1)
        )
      : 0;
  const totalPayment = emi * months;
  const totalInterest = totalPayment - loanRupees;

  return (
    <ScrollView className="flex-1 bg-night" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <View className="bg-dark rounded-xl p-4 border border-border mb-4">
        <Text className="text-white font-bold text-lg mb-1">Calculate Your EMI</Text>
        <Text className="text-text-muted text-sm mb-4">Adjust values to see your monthly payment</Text>

        <Stepper label="Home Price (L)" value={price} min={20} max={500} step={10} format={formatCr} onChange={setPrice} />
        <Stepper label="Down Payment %" value={down} min={10} max={40} step={5} format={(v) => `${v}%`} onChange={setDown} />
        <Stepper label="Interest Rate %" value={rate} min={6} max={15} step={0.5} format={(v) => `${v}%`} onChange={setRate} />
        <Stepper label="Tenure (Years)" value={tenure} min={5} max={30} step={1} format={(v) => `${v} Yrs`} onChange={setTenure} />
      </View>

      <View className="bg-teal-dim rounded-2xl p-6 border border-teal/30 mb-4 items-center">
        <Text className="text-teal text-3xl font-bold">
          ₹{emi >= 100000 ? `${(emi / 100000).toFixed(2)} L` : `${(emi / 1000).toFixed(0)}K`}
        </Text>
        <Text className="text-text-muted text-sm mt-1">Monthly EMI for {tenure} years</Text>
      </View>

      <View className="bg-dark-2 rounded-xl p-4 border border-border">
        <View className="flex-row justify-between py-2 border-b border-border">
          <Text className="text-text-muted">Loan Amount</Text>
          <Text className="text-white font-semibold">{formatCr(loanLakh)}</Text>
        </View>
        <View className="flex-row justify-between py-2 border-b border-border">
          <Text className="text-text-muted">Total Interest</Text>
          <Text className="text-white font-semibold">₹{(totalInterest / 10000000).toFixed(2)} Cr</Text>
        </View>
        <View className="flex-row justify-between py-2">
          <Text className="text-text-muted">Total Payment</Text>
          <Text className="text-white font-semibold">₹{(totalPayment / 10000000).toFixed(2)} Cr</Text>
        </View>
      </View>
    </ScrollView>
  );
}
