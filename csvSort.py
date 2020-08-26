import csv

# Open csv file
with open("bookings_export.csv", newline="") as csvfile:
    reader = csv.reader(csvfile)
print("End");