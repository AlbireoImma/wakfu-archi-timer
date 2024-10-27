import tkinter as tk
from tkinter import ttk
import time
from datetime import datetime, timedelta
import threading

class Monster:
    def __init__(self, name, respawn_minutes, location=""):
        self.name = name
        self.respawn_minutes = respawn_minutes
        self.respawn_time = None
        self.status = "Ready"
        self.timer_active = False
        self.location = location

class MonsterTimerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Monster Respawn Timer")
        self.root.geometry("850x350")
        
        # List to store monster objects
        self.monsters = []
        
        # Create main frame
        self.main_frame = ttk.Frame(root, padding="10")
        self.main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Input fields
        self.create_input_fields()
        
        # Monster list display
        self.create_monster_list()
        
        # Start update thread
        self.update_thread = threading.Thread(target=self.update_timers, daemon=True)
        self.update_thread.start()

    def create_input_fields(self):
        # Monster name input
        ttk.Label(self.main_frame, text="Monster Name:").grid(row=0, column=0, padx=5, pady=5)
        self.name_var = tk.StringVar()
        self.name_entry = ttk.Entry(self.main_frame, textvariable=self.name_var)
        self.name_entry.grid(row=0, column=1, padx=5, pady=5)
        
        # Respawn time input
        ttk.Label(self.main_frame, text="Respawn Time (minutes):").grid(row=0, column=2, padx=5, pady=5)
        self.time_var = tk.StringVar()
        self.time_entry = ttk.Entry(self.main_frame, textvariable=self.time_var)
        self.time_entry.grid(row=0, column=3, padx=5, pady=5)

        # Locaiton input
        ttk.Label(self.main_frame, text="Location: ").grid(row=0, column=4, padx=5, pady=5)
        self.location = tk.StringVar()
        self.location_entry = ttk.Entry(self.main_frame, textvariable=self.location)
        self.location_entry.grid(row=0, column=5, padx=5, pady=5)
        
        # Add button
        ttk.Button(self.main_frame, text="Add Monster", command=self.add_monster).grid(row=0, column=6, padx=5, pady=5)

    def create_monster_list(self):
        # Create tree view
        columns = ('name', 'respawn_time', 'status', 'time_remaining', 'location')
        self.tree = ttk.Treeview(self.main_frame, columns=columns, show='headings')
        
        # Define headings
        self.tree.heading('name', text='Monster Name')
        self.tree.heading('respawn_time', text='Respawn Time')
        self.tree.heading('status', text='Status')
        self.tree.heading('time_remaining', text='Time Remaining')
        self.tree.heading('location', text='Location')
        
        # Define column widths
        self.tree.column('name', width=200)
        self.tree.column('respawn_time', width=100)
        self.tree.column('status', width=100)
        self.tree.column('time_remaining', width=150)
        self.tree.column('location', width=150)
        
        # Add scrollbar
        scrollbar = ttk.Scrollbar(self.main_frame, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        # Grid tree and scrollbar
        self.tree.grid(row=1, column=0, columnspan=6, sticky='nsew', padx=5, pady=5)
        scrollbar.grid(row=1, column=6, sticky='ns')
        
        # Buttons frame
        button_frame = ttk.Frame(self.main_frame)
        button_frame.grid(row=2, column=0, columnspan=5, pady=5)
        
        ttk.Button(button_frame, text="Start Timer", command=self.start_timer).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Delete Monster", command=self.delete_monster).pack(side=tk.LEFT, padx=5)

    def add_monster(self):
        name = self.name_var.get()
        try:
            respawn_time = float(self.time_var.get())
        except ValueError:
            return
        
        if name and respawn_time > 0:
            monster = Monster(name, respawn_time)
            self.monsters.append(monster)
            self.tree.insert('', tk.END, values=(name, f"{respawn_time} min", "Ready", "--:--"))
            
            # Clear inputs
            self.name_var.set("")
            self.time_var.set("")

    def start_timer(self):
        selected_item = self.tree.selection()
        if not selected_item:
            return
            
        item_index = self.tree.index(selected_item)
        monster = self.monsters[item_index]
        
        if monster.status == "Ready":
            monster.respawn_time = datetime.now() + timedelta(minutes=monster.respawn_minutes)
            monster.status = "Spawning"
            monster.timer_active = True

    def delete_monster(self):
        selected_item = self.tree.selection()
        if not selected_item:
            return
            
        item_index = self.tree.index(selected_item)
        self.monsters.pop(item_index)
        self.tree.delete(selected_item)

    def update_timers(self):
        while True:
            for i, monster in enumerate(self.monsters):
                if monster.timer_active:
                    if datetime.now() >= monster.respawn_time:
                        monster.status = "Ready"
                        monster.timer_active = False
                        time_remaining = "--:--"
                    else:
                        time_diff = monster.respawn_time - datetime.now()
                        minutes = int(time_diff.total_seconds() // 60)
                        seconds = int(time_diff.total_seconds() % 60)
                        time_remaining = f"{minutes:02d}:{seconds:02d}"
                    
                    # Update tree item
                    item = self.tree.get_children()[i]
                    values = list(self.tree.item(item)['values'])
                    values[2] = monster.status
                    values[3] = time_remaining
                    self.tree.item(item, values=values)
            
            time.sleep(1)

def main():
    root = tk.Tk()
    app = MonsterTimerApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()