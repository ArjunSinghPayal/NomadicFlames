document.addEventListener("DOMContentLoaded", () => {
  const maintenanceSwitch = document.getElementById("maintenanceSwitch");
  if (maintenanceSwitch) {
    maintenanceSwitch.addEventListener("change", () => {
      maintenanceSwitch.form.submit();
    });
  }
});
